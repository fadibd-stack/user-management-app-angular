import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TCFTService } from '../services/tcft.service';
import { TCFTTriplet, TCFTProduct, TCFTDomain } from '../models/tcft.model';

@Component({
  selector: 'app-functions-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule
  ],
  template: `
    <div class="functions-container">
      <div class="page-header">
        <h2>TCFT Functions Browser</h2>
        <div class="stats">{{ triplets.length }} function{{ triplets.length !== 1 ? 's' : '' }} found</div>
      </div>

      <mat-card class="filters-card">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search functions</mat-label>
          <input matInput [(ngModel)]="searchTerm" (keyup.enter)="handleSearch()" placeholder="Search by name or code">
        </mat-form-field>

        <div class="filter-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Product</mat-label>
            <mat-select [(ngModel)]="selectedProduct" (selectionChange)="onProductChange()">
              <mat-option [value]="null">All Products</mat-option>
              <mat-option *ngFor="let product of products" [value]="product.id">
                {{ product.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Domain</mat-label>
            <mat-select [(ngModel)]="selectedDomain" [disabled]="!selectedProduct">
              <mat-option [value]="null">All Domains</mat-option>
              <mat-option *ngFor="let domain of domains" [value]="domain.id">
                {{ domain.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus">
              <mat-option value="">All</mat-option>
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Deprecated">Deprecated</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="handleSearch()">Search</button>
          <button mat-raised-button (click)="handleReset()">Reset</button>
        </div>
      </mat-card>

      <mat-button-toggle-group [(ngModel)]="viewMode" class="view-toggle">
        <mat-button-toggle value="table">Table View</mat-button-toggle>
        <mat-button-toggle value="hierarchy">Hierarchy View</mat-button-toggle>
      </mat-button-toggle-group>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
      </mat-card>

      <mat-card *ngIf="!loading && viewMode === 'table'" class="table-card">
        <table mat-table [dataSource]="triplets">
          <ng-container matColumnDef="fdid">
            <th mat-header-cell *matHeaderCellDef>Function ID</th>
            <td mat-cell *matCellDef="let triplet">
              <span class="code-badge">{{ triplet.fdid }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="fname">
            <th mat-header-cell *matHeaderCellDef>Function Name</th>
            <td mat-cell *matCellDef="let triplet"><strong>{{ triplet.fname }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="domain">
            <th mat-header-cell *matHeaderCellDef>Application Domain</th>
            <td mat-cell *matCellDef="let triplet">
              <div>{{ triplet.aname }}</div>
              <div class="sub-text">{{ triplet.adid }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="product">
            <th mat-header-cell *matHeaderCellDef>Product</th>
            <td mat-cell *matCellDef="let triplet">
              <div>{{ triplet.pname }}</div>
              <div class="sub-text">{{ triplet.pdid }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let triplet">
              <mat-chip [class]="'status-' + triplet.fstatus.toLowerCase()">
                {{ triplet.fstatus }}
              </mat-chip>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <p *ngIf="triplets.length === 0" class="no-data">No functions found</p>
      </mat-card>

      <div *ngIf="!loading && viewMode === 'hierarchy'" class="hierarchy-container">
        <mat-card *ngFor="let product of getHierarchy()" class="product-card">
          <div class="product-header">
            <h3>{{ product.name }}</h3>
            <span class="code-badge">{{ product.id }}</span>
          </div>

          <mat-card *ngFor="let domain of product.domains" class="domain-card">
            <div class="domain-header">
              <strong>{{ domain.name }}</strong>
              <span class="code-badge secondary">{{ domain.id }}</span>
            </div>

            <div class="functions-list">
              <div *ngFor="let func of domain.functions" class="function-item">
                <div class="function-info">
                  <span class="code-badge">{{ func.id }}</span>
                  <span>{{ func.name }}</span>
                </div>
                <mat-chip [class]="'status-' + func.status.toLowerCase()">
                  {{ func.status }}
                </mat-chip>
              </div>
            </div>
          </mat-card>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .functions-container { padding: 24px; max-width: 1600px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 28px; font-weight: 600; }
    .stats { font-size: 14px; color: #666; background-color: #f5f5f5; padding: 8px 16px; border-radius: 4px; }
    .filters-card { padding: 16px; margin-bottom: 24px; }
    .search-field { width: 100%; margin-bottom: 16px; }
    .filter-row { display: flex; gap: 16px; align-items: flex-end; }
    .filter-field { flex: 1; }
    .view-toggle { margin-bottom: 16px; }
    .loading-card { display: flex; justify-content: center; padding: 48px; }
    .table-card { overflow-x: auto; }
    .code-badge { background-color: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600; }
    .code-badge.secondary { background-color: #f5f5f5; }
    .sub-text { font-size: 12px; color: #9e9e9e; margin-top: 2px; }
    .no-data { text-align: center; padding: 48px; color: #999; }
    .status-active { background-color: #d4edda; color: #155724; }
    .status-deprecated { background-color: #f8d7da; color: #721c24; }
    .hierarchy-container { display: flex; flex-direction: column; gap: 24px; }
    .product-card { padding: 24px; border: 2px solid #1976d2; }
    .product-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e0e0e0; }
    .product-header h3 { margin: 0; font-size: 20px; font-weight: 600; }
    .domain-card { padding: 16px; margin-bottom: 12px; background-color: #f5f5f5; }
    .domain-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .functions-list { display: flex; flex-direction: column; gap: 8px; }
    .function-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; background-color: white; border-radius: 4px; }
    .function-info { display: flex; align-items: center; gap: 12px; }
  `]
})
export class FunctionsListComponent implements OnInit {
  triplets: TCFTTriplet[] = [];
  products: TCFTProduct[] = [];
  domains: TCFTDomain[] = [];
  loading = true;
  viewMode = 'table';

  searchTerm = '';
  selectedProduct: number | null = null;
  selectedDomain: number | null = null;
  selectedStatus = 'Active';

  displayedColumns = ['fdid', 'fname', 'domain', 'product', 'status'];

  constructor(private tcftService: TCFTService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.tcftService.getTriplets({ status: 'Active' }).subscribe({
      next: (triplets) => { this.triplets = triplets; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });

    this.tcftService.getProducts().subscribe({
      next: (products) => this.products = products.filter(p => p.status === 'Active'),
      error: (err) => console.error(err)
    });
  }

  onProductChange(): void {
    this.selectedDomain = null;
    this.domains = [];
    if (this.selectedProduct) {
      this.tcftService.getDomains(this.selectedProduct).subscribe({
        next: (domains) => this.domains = domains.filter(d => d.status === 'Active'),
        error: (err) => console.error(err)
      });
    }
  }

  handleSearch(): void {
    this.loading = true;
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedProduct) params.product_id = this.selectedProduct;
    if (this.selectedDomain) params.domain_id = this.selectedDomain;
    if (this.selectedStatus) params.status = this.selectedStatus;

    this.tcftService.getTriplets(params).subscribe({
      next: (triplets) => { this.triplets = triplets; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  handleReset(): void {
    this.searchTerm = '';
    this.selectedProduct = null;
    this.selectedDomain = null;
    this.selectedStatus = 'Active';
    this.domains = [];
    this.loadData();
  }

  getHierarchy(): any[] {
    const hierarchy: any = {};

    this.triplets.forEach(t => {
      if (!hierarchy[t.pdid]) {
        hierarchy[t.pdid] = {
          id: t.pdid,
          name: t.pname,
          status: t.pstatus,
          domains: []
        };
      }

      let domain = hierarchy[t.pdid].domains.find((d: any) => d.id === t.adid);
      if (!domain) {
        domain = {
          id: t.adid,
          name: t.aname,
          status: t.astatus,
          functions: []
        };
        hierarchy[t.pdid].domains.push(domain);
      }

      domain.functions.push({
        id: t.fdid,
        name: t.fname,
        status: t.fstatus
      });
    });

    return Object.values(hierarchy);
  }
}
