import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdviceService } from '../services/advice.service';
import { AuthService } from '../../../core/services/auth.service';
import { Advice } from '../models/advice.model';
import { AdviceFormComponent } from './advice-form.component';

@Component({
  selector: 'app-advice-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="advice-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2>Advice Requests</h2>
            <p>Ask questions and get expert advice on test cases</p>
          </div>
          <button mat-raised-button color="primary" (click)="createNewAdvice()">
            <mat-icon>add</mat-icon>
            New Request
          </button>
        </div>
      </div>

      <mat-card *ngIf="message" class="message-card">
        {{ message }}
      </mat-card>

      <div class="filter-bar">
        <label>Filter by Status:</label>
        <mat-form-field appearance="outline">
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="fetchAdvice()">
            <mat-option value="all">All</mat-option>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="answered">Answered</mat-option>
            <mat-option value="closed">Closed</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="main-content">
        <mat-card class="list-panel">
          <div *ngIf="loading" class="loading">Loading...</div>
          <div *ngIf="!loading && adviceList.length === 0" class="empty">No advice requests found</div>
          <div
            *ngFor="let advice of adviceList"
            class="advice-item"
            [class.selected]="selectedAdvice?.id === advice.id"
            (click)="selectAdvice(advice)"
          >
            <div class="advice-header">
              <span class="advice-id">Advice #{{ advice.id }}</span>
              <mat-chip [class]="'status-' + advice.status">{{ advice.status }}</mat-chip>
            </div>
            <div class="advice-test-case">Test Case #{{ advice.test_case_id }}</div>
            <div class="advice-question">{{ advice.question_text.substring(0, 80) }}{{ advice.question_text.length > 80 ? '...' : '' }}</div>
            <div class="advice-messages">{{ advice.messages?.length || 0 }} message{{ advice.messages?.length !== 1 ? 's' : '' }}</div>
          </div>
        </mat-card>

        <mat-card class="thread-panel">
          <div *ngIf="!selectedAdvice" class="empty-thread">Select an advice request to view details and messages</div>

          <div *ngIf="selectedAdvice">
            <div class="thread-header">
              <h3>Advice #{{ selectedAdvice.id }}</h3>
              <mat-chip [class]="'status-' + selectedAdvice.status">{{ selectedAdvice.status }}</mat-chip>
            </div>

            <div class="thread-details">
              <div class="detail-row"><strong>Test Case:</strong> #{{ selectedAdvice.test_case_id }}</div>
              <div class="detail-row"><strong>Asked by:</strong> User #{{ selectedAdvice.asked_by_id }}</div>
              <div class="detail-row"><strong>Asked to:</strong> User #{{ selectedAdvice.asked_to_id }}</div>
              <div class="detail-row"><strong>Question:</strong> {{ selectedAdvice.question_text }}</div>
            </div>

            <mat-divider></mat-divider>

            <div class="messages-section">
              <h4>Messages</h4>
              <div *ngIf="!selectedAdvice.messages || selectedAdvice.messages.length === 0" class="no-messages">
                No messages yet
              </div>
              <div *ngFor="let msg of selectedAdvice.messages" class="message-item">
                <div class="message-header">
                  <strong>User #{{ msg.author_user_id }}</strong>
                  <span class="message-time">{{ msg.created_at | date:'short' }}</span>
                </div>
                <div class="message-body">{{ msg.body }}</div>
              </div>
            </div>

            <div *ngIf="selectedAdvice.status !== 'closed'" class="action-section">
              <h4>Post Message</h4>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Your message</mat-label>
                <textarea matInput [(ngModel)]="newMessage" rows="3"></textarea>
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="postMessage()">Post Message</button>
            </div>

            <div *ngIf="canAnswer(selectedAdvice)" class="action-section">
              <h4>Answer Advice</h4>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Your answer</mat-label>
                <textarea matInput [(ngModel)]="answerText" rows="3"></textarea>
              </mat-form-field>
              <button mat-raised-button color="accent" (click)="answerAdvice()">Submit Answer</button>
            </div>

            <div *ngIf="canResolve(selectedAdvice) && selectedAdvice.status !== 'closed'" class="action-section">
              <h4>Resolve Advice</h4>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Resolution summary (optional)</mat-label>
                <textarea matInput [(ngModel)]="resolutionSummary" rows="2"></textarea>
              </mat-form-field>
              <button mat-raised-button color="warn" (click)="resolveAdvice()">Mark as Resolved</button>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .advice-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-content h2 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1976d2; }
    .header-content p { margin: 0; color: #666; font-size: 14px; }
    .header-content button mat-icon { margin-right: 8px; }
    .message-card { padding: 16px; margin-bottom: 24px; background-color: #e3f2fd; }
    .filter-bar { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; }
    .filter-bar label { font-weight: 600; }
    .main-content { display: flex; gap: 24px; height: calc(100vh - 280px); }
    .list-panel { flex: 0 0 400px; overflow-y: auto; padding: 0; }
    .thread-panel { flex: 1; overflow-y: auto; padding: 24px; }
    .loading, .empty { text-align: center; padding: 48px; color: #9e9e9e; }
    .advice-item { padding: 16px; border-bottom: 1px solid #e0e0e0; cursor: pointer; transition: background-color 0.2s; }
    .advice-item:hover { background-color: #f5f5f5; }
    .advice-item.selected { background-color: #e3f2fd; border-left: 4px solid #1976d2; }
    .advice-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .advice-id { font-weight: 600; }
    .advice-test-case { font-size: 12px; color: #9e9e9e; margin-bottom: 8px; }
    .advice-question { font-size: 14px; margin-bottom: 8px; }
    .advice-messages { font-size: 11px; color: #9e9e9e; }
    .status-pending { background-color: #fff3cd; color: #856404; }
    .status-answered { background-color: #d1ecf1; color: #0c5460; }
    .status-closed { background-color: #d4edda; color: #155724; }
    .empty-thread { text-align: center; padding: 48px; color: #9e9e9e; font-size: 16px; }
    .thread-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e0e0e0; }
    .thread-header h3 { margin: 0; }
    .thread-details { padding: 16px; background-color: #f5f5f5; border-radius: 4px; margin-bottom: 24px; }
    .detail-row { margin-bottom: 8px; font-size: 14px; }
    .messages-section { margin: 24px 0; }
    .messages-section h4 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    .no-messages { text-align: center; padding: 24px; color: #9e9e9e; font-style: italic; }
    .message-item { padding: 16px; margin-bottom: 12px; background-color: #f5f5f5; border-radius: 4px; border: 1px solid #e0e0e0; }
    .message-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .message-time { color: #9e9e9e; font-size: 12px; }
    .message-body { font-size: 14px; line-height: 1.5; }
    .action-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e0e0e0; }
    .action-section h4 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
    .full-width { width: 100%; }
  `]
})
export class AdviceListComponent implements OnInit {
  adviceList: Advice[] = [];
  selectedAdvice: Advice | null = null;
  loading = true;
  message = '';
  statusFilter = 'all';
  newMessage = '';
  answerText = '';
  resolutionSummary = '';
  currentUser: any;

  constructor(
    private adviceService: AdviceService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    console.log('🎯 AdviceListComponent loaded - NEW VERSION with createNewAdvice button!');
    this.fetchAdvice();
  }

  fetchAdvice(): void {
    this.loading = true;
    const status = this.statusFilter === 'all' ? undefined : this.statusFilter;
    const currentlySelectedId = this.selectedAdvice?.id;

    this.adviceService.getAdvice(status).subscribe({
      next: (advice) => {
        this.adviceList = advice;

        // Re-select the currently selected advice if it exists
        if (currentlySelectedId) {
          this.selectedAdvice = this.adviceList.find(a => a.id === currentlySelectedId) || null;
        }

        this.loading = false;
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  selectAdvice(advice: Advice): void {
    this.selectedAdvice = advice;
    this.newMessage = '';
    this.answerText = '';
    this.resolutionSummary = '';
  }

  postMessage(): void {
    if (!this.newMessage.trim() || !this.selectedAdvice) {
      this.message = 'Message cannot be empty';
      return;
    }

    this.adviceService.postMessage(this.selectedAdvice.id, this.newMessage).subscribe({
      next: () => {
        this.message = 'Message posted successfully!';
        this.newMessage = '';
        this.fetchAdvice();
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error('Error posting message:', err);
        this.message = err.error?.detail || err.message || 'Error posting message';
      }
    });
  }

  answerAdvice(): void {
    if (!this.answerText.trim() || !this.selectedAdvice) {
      this.message = 'Answer cannot be empty';
      return;
    }

    this.adviceService.answerAdvice(this.selectedAdvice.id, this.answerText).subscribe({
      next: () => {
        this.message = 'Advice answered successfully!';
        this.answerText = '';
        this.fetchAdvice();
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error('Error answering advice:', err);
        this.message = err.error?.detail || err.message || 'Error answering advice';
      }
    });
  }

  resolveAdvice(): void {
    if (!this.selectedAdvice) return;

    this.adviceService.resolveAdvice(this.selectedAdvice.id, this.resolutionSummary).subscribe({
      next: () => {
        this.message = 'Advice resolved successfully!';
        this.selectedAdvice = null;
        this.resolutionSummary = '';
        this.fetchAdvice();
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error('Error resolving advice:', err);
        this.message = err.error?.detail || err.message || 'Error resolving advice';
      }
    });
  }

  createNewAdvice(): void {
    const dialogRef = this.dialog.open(AdviceFormComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.message = 'Advice request created successfully!';
        this.fetchAdvice();
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  canAnswer(advice: Advice): boolean {
    return advice.asked_to_id === this.currentUser?.id && advice.status === 'pending';
  }

  canResolve(advice: Advice): boolean {
    return advice.asked_by_id === this.currentUser?.id || this.currentUser?.is_superuser;
  }
}
