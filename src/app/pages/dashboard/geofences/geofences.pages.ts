import { Component, effect, input, signal } from '@angular/core';
import { GeofenceFormComponent } from './components/geofence-form/geofence-form.component';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { GeofenceService } from '../../../core/services/geofence/geofence.service';
import { Geofence } from '../../../core/models/response/geofence.model';
import { Response } from '../../../core/models/response/response.model';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { GeofenceListItemComponent } from './components/geofence-list-item/geofence-list-item.component';
import { DeleteDialogComponent } from '../../../shared/components/delete-dialog/delete-dialog.component';
import { SuccessResponse } from '../../../core/models/response/success-response.model';

@Component({
  selector: 'app-geofences',
  standalone: true,
  imports: [
    DialogComponent,
    GeofenceFormComponent,
    GeofenceListItemComponent,
    DeleteDialogComponent,
  ],
  templateUrl: './geofences.pages.html',
  styleUrl: './geofences.pages.css',
})
export class GeofencesPages {
  readonly groupId = input.required<number>();

  geofences: Geofence[] = [];

  geofenceToEdit: Geofence | null = null;
  geofenceToDelete: Geofence | null = null;

  private _showFormDialog = signal(false);
  showFormDialog = this._showFormDialog.asReadonly();

  private _showDeleteDialog = signal(false);
  showDeleteDialog = this._showDeleteDialog.asReadonly();

  constructor(
    private geofenceService: GeofenceService,
    private loadingService: LoadingService,
  ) {}

  private loadData = effect(
    () => {
      this.list();
    },
    { allowSignalWrites: true },
  );

  private list() {
    this.loadingService.setLoading();
    this.geofenceService.list(this.groupId()).subscribe({
      next: ({ data }: Response<Geofence[]>) => {
        this.geofences = data;
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  hideFormDialog() {
    this._showFormDialog.set(false);
  }

  hideDeleteDialog() {
    this.geofenceToDelete = null;
    this._showDeleteDialog.set(false);
  }

  createMode() {
    this.geofenceToEdit = null;
    this._showFormDialog.set(true);
  }

  addGeofence(geofence: Geofence) {
    const index = this.geofences.findIndex(
      (g) => g.geofenceId === geofence.geofenceId,
    );

    if (index !== -1) {
      this.geofences[index] = geofence;
      this.hideFormDialog();
      return;
    }

    this.geofences.push(geofence);
    this.hideFormDialog();
  }

  editGeofence(geofence: Geofence) {
    this.geofenceToEdit = geofence;
    this._showFormDialog.set(true);
  }

  deleteGeofence(geofence: Geofence) {
    this.geofenceToDelete = geofence;
    this._showDeleteDialog.set(true);
  }

  onDeleteConfirm(shouldDelete: boolean) {
    if (!shouldDelete || !this.geofenceToDelete) return;

    this.loadingService.setLoading();
    this.geofenceService
      .delete(this.groupId(), this.geofenceToDelete!.geofenceId)
      .subscribe({
        next: ({ data }: Response<SuccessResponse>) => {
          if (data.success) {
            this.geofences = this.geofences.filter(
              (geofence) =>
                geofence.geofenceId !== this.geofenceToDelete!.geofenceId,
            );
            this.hideDeleteDialog();
          }
          this.loadingService.dismissLoading();
        },
        error: (err: any) => {
          console.error('error:', err);
          this.loadingService.dismissLoading();
        },
      });
  }
}
