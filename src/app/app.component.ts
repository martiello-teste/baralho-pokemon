import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { EditFolderDialogComponent } from './edit-folder-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})  
export class AppComponent {
  cardDetails: any;
  cards: any[] = [];
  folderName: string = '';
  folders: string[] = [];
  isFolderModalOpen: boolean = false;
  isAddCardsModalOpen: boolean = false;
  selectedFolder: string | null = null;
  selectedCards: { [key: string]: boolean } = {};
  folderCards: { [key: string]: string[] } = {};
  selectedCardId: string | null = null;
  isCardModalOpen: boolean = false;
  editedFolderName: string = '';
  isEditFolderModalOpen: boolean = false;
  pokemonSubtypes: string[] = [];
  selectedFolderCardDetails: any | null = null;
  isLoading: boolean = false;
  uniqueTypesCount: number = 0;
  pokemonSupertypesCount: number = 0;
  selectedCardCounts: { [key: string]: number } = {};


  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit() {
    this.loadFirst30Cards();
    this.loadPokemonSubtypes();
  }

  loadPokemonSubtypes() {
    this.http.get<any>('https://api.pokemontcg.io/v2/subtypes').subscribe(
      (response) => {
        this.pokemonSubtypes = response.data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  loadFirst30Cards() {
    this.http.get<any>('https://api.pokemontcg.io/v2/cards').subscribe(
      (response) => {
        this.cards = response.data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  createFolder() {
    if (this.folderName.trim() !== '') {
      this.folders.push(this.folderName);
      this.folderName = '';
    }
  }

  openFolderModal(folder: string) {
    this.selectedFolder = folder;
    this.isFolderModalOpen = true;
  
    const allTypes = this.getFolderCards().map(cardId => this.getCardType(cardId));
    this.uniqueTypesCount = new Set(allTypes).size;
    this.pokemonSupertypesCount = this.getFolderCards().filter(cardId => this.getCardSupertype(cardId) === 'Pokémon').length;
  }

  getFolderCards() {
    return this.selectedFolder ? this.folderCards[this.selectedFolder] || [] : [];
  }

  closeFolderModal() {
    this.selectedFolder = null;
    this.isFolderModalOpen = false;
    this.selectedCards = {};
  }

  
    openAddCardsModal(folder: string) {
      this.isLoading = true;

      setTimeout(() => {
        this.selectedFolder = folder;
        this.isAddCardsModalOpen = true;
        setTimeout(() => {
          this.isLoading = false;
        }, 2000);
      }, 2000);
    }

    toggleCardSelection(card: any) {
      if (!this.selectedCards[card.id]) {
        if ((this.selectedCardCounts[card.name] || 0) >= 4) {
          alert('Você só pode adicionar até 4 cartas com o mesmo nome.');
          return;
        }
      }
    
      this.selectedCardCounts[card.name] = (this.selectedCardCounts[card.name] || 0) + (this.selectedCards[card.id] ? -1 : 1);
      this.selectedCards[card.id] = !this.selectedCards[card.id];
    }

    saveSelectedCards() {
      const selectedCardIds = Object.keys(this.selectedCards).filter(id => this.selectedCards[id]);
      const totalSelectedCards = selectedCardIds.length;
    
      const cardCounts: { [key: string]: number } = {};
      selectedCardIds.forEach(id => {
        const cardName = this.getCardName(id);
        cardCounts[cardName] = (cardCounts[cardName] || 0) + 1;
      });
    
      const exceedLimitCardNames = Object.keys(cardCounts).filter(name => cardCounts[name] > 4);
      if (exceedLimitCardNames.length > 0) {
        alert(`Você só pode adicionar até 4 cartas com o mesmo nome. As seguintes cartas excedem o limite: ${exceedLimitCardNames.join(', ')}`);
        return;
      }
    
      if (totalSelectedCards < 24 || totalSelectedCards > 60) {
        alert('Você deve selecionar entre 24 e 60 cartas para salvar a pasta.');
        return;
      }
    
      if (this.selectedFolder && !this.folderCards[this.selectedFolder]) {
        this.folderCards[this.selectedFolder] = [];
      }
    
      if (this.selectedFolder) {
        this.folderCards[this.selectedFolder] = this.folderCards[this.selectedFolder].concat(selectedCardIds);
        this.isAddCardsModalOpen = false;
      }
    }
    
    
    

  getCardImage(cardId: string) {
    const card = this.cards.find(c => c.id === cardId);
    return card ? card.images.large : '';
  }

  getCardName(cardId: string) {
    const card = this.cards.find(c => c.id === cardId);
    return card ? card.name : '';
  }
  getCardType(cardId: string) {
    const card = this.cards.find(c => c.id === cardId);
    return card ? card.types.join(', ') : '';
  }
  
  getCardSubtype(cardId: string) {
    const card = this.cards.find(c => c.id === cardId);
    return card ? card.subtypes.join(', ') : '';
  }
  
  getCardSupertype(cardId: string) {
    const card = this.cards.find(c => c.id === cardId);
    return card ? card.supertype : '';
  }
  
  getCardRarity(cardId: string) {
    const card = this.cards.find(c => c.id === cardId);
    return card ? card.rarity : '';
  }

  removeCardFromFolder(cardId: string) {
    if (this.selectedFolder && this.folderCards[this.selectedFolder] !== null) {
      const index = this.folderCards[this.selectedFolder].indexOf(cardId);
      if (index !== -1) {
        this.folderCards[this.selectedFolder].splice(index, 1);
      }
    }
  }

  selectCard(cardId: string) {
    this.loadCardDetails(cardId);
  }

  getCardDescription(cardId: string) {
    const card = this.cards.find(c => c.id === cardId);
    return card ? card.description : '';
  }

  expandCard(cardId: string) {
    this.selectedCardId = cardId;
  }

  closeCardDetails() {
    this.selectedCardId = null;
  }

  openCardModal(cardId: string) {
    this.selectedCardId = cardId;
    this.isCardModalOpen = true;
  }

  closeCardModal() {
    this.isCardModalOpen = false;
  }

  openEditFolderModal(folder: string) {
    this.editedFolderName = folder;
    this.isEditFolderModalOpen = true;
  }

  editFolderName() {
    if (this.selectedFolder) {
      const index = this.folders.indexOf(this.selectedFolder);
      if (index !== -1) {
        this.folders[index] = this.editedFolderName;
        this.isEditFolderModalOpen = false;
      }
    }
  }

  closeEditFolderModal() {
    this.isEditFolderModalOpen = false;
    this.editedFolderName = '';
  }

  openDeleteFolderModal(folder: string) {
  }

  openEditFolderDialog(folderName: string): void {
    const dialogRef = this.dialog.open(EditFolderDialogComponent, {
      width: '250px',
      data: { folderName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.folders.indexOf(folderName);
        if (index !== -1) {
          this.folders[index] = result;
        }
      }
    });
  }

  deleteFolder(folderName: string): void {
    const index = this.folders.indexOf(folderName);
    if (index !== -1) {
      this.folders.splice(index, 1);
    }
  }
  openFolderCardDetailsModal(cardId: string) {
    const cardDetails = this.getCardDetails(cardId);
    if (cardDetails) {
      this.selectedFolderCardDetails = { ...cardDetails };
    } else {
      this.selectedFolderCardDetails = null;
    }
  }
  closeFolderCardDetailsModal() {
    this.selectedFolderCardDetails = null;
  }

  getCardDetails(cardId: string) {
    const card = this.cards.find(c => c.id === cardId);
    return card ? { ...card } : null;
  }

  loadCardDetails(cardId: string) {
    this.http.get<any>(`https://api.pokemontcg.io/v2/cards/${cardId}`).subscribe(
      (response) => {
        this.cardDetails = response.data;
        console.log(this.cardDetails = response.data);
      },
      (error) => {
        console.error(error);
      }
    );
  }
}