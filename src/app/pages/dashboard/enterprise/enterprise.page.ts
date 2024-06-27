import { Component } from '@angular/core';
import { EnterpriseService } from '../../../core/services/enterprise/enterprise.service';
import { Enterprise } from '../../../core/models/response/enterprise-response.model';
import { Response } from '../../../core/models/response/response.model';
import { SignUpUrl } from '../../../core/models/response/sign-up-url.model';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CreateEnterprise } from '../../../core/models/request/create-enterprise.model';
import { Router } from '@angular/router';
import { LoadingService } from '../../../core/services/loading/loading.service';

@Component({
  selector: 'app-enterprise',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './enterprise.page.html',
  styleUrl: './enterprise.page.css',
})
export class EnterprisePage {
  enterprises: Enterprise[] = [];
  signUpUrl: string = '';
  enterpriseRegisterForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    token: new FormControl('', [Validators.required]),
  });

  constructor(
    private enterpriseService: EnterpriseService,
    private router: Router,
    readonly loadingService: LoadingService,
  ) {
    // this.list();
  }

  private list() {
    this.enterpriseService.list().subscribe({
      next: ({ data }: Response<Enterprise[]>) => {
        this.enterprises = data;
      },
      error: (err: any) => {
        console.error('error:', err);
      },
    });
  }

  signUp() {
    this.loadingService.setLoading();
    this.enterpriseService.signUp().subscribe({
      next: ({ data }: Response<SignUpUrl>) => {
        this.signUpUrl = data.url;
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  createEnterprise() {
    if (this.enterpriseRegisterForm.invalid) return;

    this.loadingService.setLoading();

    const createEnterprise: CreateEnterprise = {
      enterpriseDisplayName: this.enterpriseRegisterForm.value.name!,
      signupUrlName: this.signUpUrl,
      enterpriseToken: this.enterpriseRegisterForm.value.token!,
    };

    this.enterpriseService.create(createEnterprise).subscribe({
      next: ({ data }: Response<Enterprise>) => {
        this.enterprises.push(data);
        this.enterpriseService.setEnterpriseId(data.enterpriseId);
        this.router.navigate(['/groups'], { replaceUrl: true });
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }
}
