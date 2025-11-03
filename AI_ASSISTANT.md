# AI Assistant Feature Documentation

**Feature Status:** ✅ UI Complete - Backend Integration Pending
**Version:** 1.0.0
**Last Updated:** November 1, 2025

---

## 📋 Overview

The AI Assistant is an intelligent chat interface integrated into the TrakIntel application, providing users with contextual help and guidance directly within the platform.

### Key Features

- **Sliding Chat Panel** - Accessible from any page via toolbar icon
- **Real-time Messaging** - Interactive chat interface with message history
- **Custom Branding** - Styled to match InterSystems brand colors
- **Responsive Design** - Works on desktop and mobile devices
- **Keyboard Support** - Send messages with Enter key
- **Always Available** - Persistent across all application pages

---

## 🎨 User Interface

### AI Assistant Button

**Location:** Top toolbar, next to the search bar

**Design:**
- Custom SVG icon with gradient background (blue #4F7CFF to purple #A855F7)
- Stethoscope symbol representing healthcare/medical focus
- Sparkle decorations indicating AI capability
- "AI" text label
- Height: 28px with auto width
- Hover effect: Slight scale (1.05x)

**Icon File:** `/src/assets/ai-assistant-icon.svg`

### Chat Panel

**Design Specifications:**
- Width: 400px (fixed)
- Height: Full viewport height minus toolbar (calc(100vh - 42px))
- Position: Fixed, slides in from right side
- Animation: 0.3s ease transition
- Z-index: 999 (overlays content but below modals)

**Layout:**
```
┌─────────────────────────────────────┐
│  AI Assistant                    ✕  │ ← Header (gradient)
├─────────────────────────────────────┤
│                                     │
│  Hello! I'm your AI                │ ← AI message
│  Assistant...                       │
│                                     │
│            How can I help you? ───┐ │ ← User message
│                                     │
│                                     │
├─────────────────────────────────────┤
│  Type your message...          ➤   │ ← Input field
└─────────────────────────────────────┘
```

### Color Scheme

**Header:**
- Background: Linear gradient from #233575 to #1a2962
- Text: White
- Close button: White with hover effect

**Messages:**
- AI messages: White background, left-aligned
- User messages: Gradient background (#233575 to #1a2962), right-aligned, white text
- Message bubbles: Max-width 60%, centered text, rounded corners (12px)
- Box shadow: Subtle elevation (0 1px 2px rgba(0,0,0,0.1))

**Input Area:**
- Background: White
- Border: Top border (#e0e0e0)
- Send button: Material icon, disabled when empty

---

## 🔧 Technical Implementation

### Component Location

**File:** `src/app/core/components/main-layout.component.ts`

The AI Assistant is part of the MainLayoutComponent, making it globally available across all authenticated pages.

### Component Structure

```typescript
export class MainLayoutComponent {
  // AI Chat state
  aiChatOpen = false;
  aiInputText = '';
  aiMessages: { text: string; isUser: boolean }[] = [];

  // Methods
  openAIAssistant(): void { }
  closeAIAssistant(): void { }
  sendAIMessage(): void { }
}
```

### Template Structure

```html
<!-- AI Assistant Button in Toolbar -->
<button mat-button class="ai-assistant-btn" (click)="openAIAssistant()">
  <img src="assets/ai-assistant-icon.svg" alt="AI Assistant" class="ai-icon">
</button>

<!-- AI Chat Panel -->
<div class="ai-chat-panel" [class.open]="aiChatOpen">
  <div class="ai-chat-header">
    <h3>AI Assistant</h3>
    <button mat-icon-button (click)="closeAIAssistant()">
      <mat-icon>close</mat-icon>
    </button>
  </div>
  <div class="ai-chat-messages">
    <div *ngFor="let message of aiMessages"
         class="ai-message"
         [class.user]="message.isUser">
      <div class="message-bubble">{{ message.text }}</div>
    </div>
  </div>
  <div class="ai-chat-input">
    <mat-form-field appearance="outline" class="chat-input-field">
      <input matInput
             placeholder="Type your message..."
             [(ngModel)]="aiInputText"
             (keyup.enter)="sendAIMessage()">
      <button mat-icon-button
              matSuffix
              (click)="sendAIMessage()"
              [disabled]="!aiInputText.trim()">
        <mat-icon>send</mat-icon>
      </button>
    </mat-form-field>
  </div>
</div>
```

### CSS Styling

**Key Classes:**
- `.ai-assistant-btn` - Toolbar button styling
- `.ai-chat-panel` - Main panel container
- `.ai-chat-panel.open` - Shown state (right: 0)
- `.ai-chat-header` - Gradient header with title
- `.ai-chat-messages` - Scrollable message area
- `.ai-message` - Individual message container
- `.ai-message.user` - User message styling
- `.message-bubble` - Message content styling
- `.ai-chat-input` - Input area at bottom

---

## 💬 Message Flow

### Opening the Chat

1. User clicks AI icon in toolbar
2. `openAIAssistant()` method called
3. `aiChatOpen` set to `true`
4. Panel slides in from right (CSS transition)
5. If first time opening, welcome message added to `aiMessages`

### Sending a Message

1. User types message in input field
2. User clicks send button OR presses Enter
3. `sendAIMessage()` method called
4. User message added to `aiMessages` array with `isUser: true`
5. Input field cleared
6. AI response generated (currently demo response after 500ms delay)
7. AI response added to `aiMessages` array with `isUser: false`
8. Messages auto-scroll to show latest

### Closing the Chat

1. User clicks ✕ close button
2. `closeAIAssistant()` method called
3. `aiChatOpen` set to `false`
4. Panel slides out to right (CSS transition)
5. Chat history preserved (messages remain in array)

---

## 🔄 Current Functionality

### Demo Mode (Current Implementation)

**Behavior:**
- Welcome message: "Hello! I'm your AI Assistant. How can I help you today?"
- All user messages receive demo response: "This is a demo response. AI Assistant integration coming soon!"
- 500ms simulated delay for AI response
- Chat history persists during session
- Messages cleared on logout/page refresh

**Welcome Message Trigger:**
- Only shown when `aiMessages` array is empty
- Appears when user first opens the AI panel
- Not shown again if chat history exists

---

## 🚀 Future Backend Integration

### Planned API Integration

**Endpoint:** `POST /api/ai-assistant/chat`

**Request Format:**
```typescript
{
  userId: number;
  message: string;
  context?: {
    currentPage: string;
    currentFeature: string;
    userRole: string;
    organizationId: number;
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

**Response Format:**
```typescript
{
  response: string;
  confidence?: number;
  suggestions?: string[];
  relatedArticles?: Array<{
    title: string;
    url: string;
  }>;
}
```

### Service Implementation (Planned)

**File:** `src/app/core/services/ai-assistant.service.ts`

```typescript
@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  constructor(private apiService: ApiService) {}

  sendMessage(
    message: string,
    context?: any
  ): Observable<AiResponse> {
    return this.apiService.post('/api/ai-assistant/chat', {
      message,
      context
    });
  }
}
```

### Integration Steps

1. Create `ai-assistant.service.ts` in core services
2. Update `sendAIMessage()` to call service instead of demo response
3. Add error handling for API failures
4. Implement conversation history tracking
5. Add context awareness (current page, user permissions)
6. Add typing indicators during API calls
7. Implement rate limiting on frontend
8. Add message timestamps
9. Add message editing/deletion
10. Add conversation export functionality

---

## 📊 Context Awareness (Planned)

### Page Context

The AI should be aware of the user's current location:

```typescript
const context = {
  currentPage: this.router.url,
  feature: this.getFeatureFromRoute(),
  userRole: this.authService.currentUser?.permission_level,
  organizationId: this.authService.currentUser?.organization_id
};
```

### Smart Responses

Examples of context-aware responses:

**On Test Cases Page:**
- "I can help you create, edit, or organize test cases. What would you like to do?"

**On Test Executions Page:**
- "I can guide you through running tests or analyzing execution results."

**On JIRA Page:**
- "I can help you configure JIRA integration or sync issues."

**On Audit Trail Page:**
- "I can help you search audit logs or explain specific events."

---

## 🎯 Use Cases

### Help & Documentation
- Answer questions about features
- Provide step-by-step guides
- Explain terminology
- Link to relevant documentation

### Task Assistance
- Guide through complex workflows
- Suggest best practices
- Validate data entry
- Provide examples

### Troubleshooting
- Debug issues
- Explain error messages
- Suggest solutions
- Escalate to support if needed

### Navigation
- Help find features
- Explain menu structure
- Suggest related pages
- Provide shortcuts

---

## 🔐 Security Considerations

### Authentication
- AI panel only available to authenticated users
- User ID included in all AI requests
- Requests protected by auth guard

### Data Privacy
- No sensitive data stored in chat history on frontend
- Conversation history cleared on logout
- Backend should sanitize/validate all inputs
- Rate limiting to prevent abuse

### Content Safety
- AI responses should be validated
- Prevent injection attacks
- Filter inappropriate content
- Log all interactions for audit

---

## ♿ Accessibility

### Current Implementation
- Keyboard navigation supported (Enter to send)
- Close button accessible via keyboard
- Material components follow ARIA guidelines

### Planned Improvements
- Screen reader announcements for new messages
- Keyboard shortcuts (ESC to close, Ctrl+/ to open)
- High contrast mode support
- Focus management when opening/closing panel
- ARIA live regions for message updates

---

## 📱 Responsive Behavior

### Desktop (Current)
- Full 400px width panel
- Slides in from right
- Overlays content without pushing it

### Mobile (Future Enhancement)
- Full-screen panel on small devices
- Bottom sheet style on tablets
- Touch-friendly buttons and inputs
- Gesture support (swipe to close)

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Click AI icon opens panel
- [ ] Click close button closes panel
- [ ] Type message and click send works
- [ ] Press Enter sends message
- [ ] Send button disabled when input empty
- [ ] Welcome message appears on first open
- [ ] Messages display correctly (user vs AI)
- [ ] Panel slides smoothly
- [ ] Panel persists across page navigation
- [ ] Chat history preserved during session

### Future Automated Tests
- Unit tests for message handling
- Component tests for UI interactions
- Integration tests with AI service
- E2E tests for user workflows

---

## 📈 Analytics (Planned)

Track the following metrics:
- Total AI sessions initiated
- Messages sent per session
- Most common questions/topics
- User satisfaction ratings
- Response accuracy feedback
- Average session duration
- Feature adoption rate

---

## 🐛 Known Limitations

### Current
- Demo responses only (no real AI)
- No conversation persistence (cleared on refresh)
- No message timestamps
- No message editing/deletion
- No file/image sharing
- No code highlighting in responses
- No markdown rendering

### Technical Debt
- Message array grows indefinitely (needs cleanup)
- No error handling for message failures
- No loading/typing indicators
- No retry mechanism
- No offline support

---

## 🎓 Best Practices

### For Users
- Be specific in questions
- Provide context when asking for help
- Use clear, concise language
- Review AI suggestions before acting

### For Developers
- Always sanitize user input
- Validate AI responses
- Handle API errors gracefully
- Log interactions for debugging
- Monitor performance impact
- Test across different browsers

---

## 🔗 Related Files

- **Component:** `src/app/core/components/main-layout.component.ts`
- **Icon:** `src/assets/ai-assistant-icon.svg`
- **Service (planned):** `src/app/core/services/ai-assistant.service.ts`
- **Styles:** Embedded in main-layout.component.ts
- **Models (planned):** `src/app/core/models/ai-assistant.model.ts`

---

## 📚 Additional Resources

- [Angular Material Components](https://material.angular.io)
- [RxJS Documentation](https://rxjs.dev)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)

---

**Maintained by:** TrakIntel Development Team
**Feature Owner:** [To be assigned]
**Status:** Phase 1 Complete (UI) - Phase 2 Pending (Backend Integration)
