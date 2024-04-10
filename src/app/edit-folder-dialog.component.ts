import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-folder-dialog',
  template: `
    <h2 mat-dialog-title>Editar Pasta</h2>
    <div mat-dialog-content>
      <mat-form-field>
        <input matInput [(ngModel)]="folderName" placeholder="Nome da Pasta">
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancelClick()">Cancelar</button>
      <button mat-button [mat-dialog-close]="folderName" cdkFocusInitial>Salvar</button>
    </div>
  `,
})
export class EditFolderDialogComponent {
  folderName: string;

  constructor(
    public dialogRef: MatDialogRef<EditFolderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.folderName = data.folderName;
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
