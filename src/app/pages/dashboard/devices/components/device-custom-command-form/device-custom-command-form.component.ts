import { Component, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoadingService } from '../../../../../core/services/loading/loading.service';
import { DeviceCustomCommand } from '../../../../../core/enums/device-custom-command';
import { DeviceService } from '../../../../../core/services/device/device.service';
import { DeviceCustomCommandRequest } from '../../../../../core/models/request/device-custom-command-request.model';
import { SuccessResponse } from '../../../../../core/models/response/success-response.model';
import { Response } from '../../../../../core/models/response/response.model';
import { Device } from '../../../../../core/models/response/device.model';

@Component({
  selector: 'app-device-custom-command-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './device-custom-command-form.component.html',
  styleUrl: './device-custom-command-form.component.css',
})
export class DeviceCustomCommandFormComponent {
  readonly groupId = input.required<number>();
  readonly device = input.required<Device | null>();

  readonly loadingService = inject(LoadingService);
  private readonly deviceService = inject(DeviceService);

  customCommandForm = new FormGroup({
    command: new FormControl(DeviceCustomCommand.ADJUST_BRIGHTNESS),
    value: new FormControl(0, [Validators.min(0)]),
  });

  sendCustomCommandForm() {
    if (this.customCommandForm.invalid) return;

    this.loadingService.setLoading();

    const deviceCustomCommandRequest: DeviceCustomCommandRequest = {
      deviceCustomCommand: this.customCommandForm.value.command!,
      value: this.customCommandForm.value.value!,
    };

    this.deviceService
      .sendCustomCommand(
        this.groupId(),
        this.device()!.deviceId,
        deviceCustomCommandRequest,
      )
      .subscribe({
        next: ({ data }: Response<SuccessResponse>) => {
          if (data.success) {
            console.log('Comando enviado');
          }
          this.loadingService.dismissLoading();
        },
        error: (err: any) => {
          console.error('error:', err);
          this.loadingService.dismissLoading();
        },
      });
  }

  readonly DeviceCustomCommand = DeviceCustomCommand;
  readonly deviceCustomCommandKeys = Object.keys(DeviceCustomCommand) as [
    keyof typeof DeviceCustomCommand,
  ];
}
