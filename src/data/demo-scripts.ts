export interface DemoMessage {
  sender: "customer" | "ai" | "system";
  text: string;
  agentLabel?: string;
  delay?: number; // ms between this and next
}

export interface DemoScript {
  industry: string;
  title: string;
  messages: DemoMessage[];
}

export function getDemoScript(companyName: string, industries: string[]): DemoScript {
  // Pick script based on first selected industry
  const primary = industries[0] || "insurance";

  const scripts: Record<string, DemoScript> = {
    insurance: {
      industry: "Insurance",
      title: "Claims Filing Experience",
      messages: [
        { sender: "ai", text: `Hi! Welcome to ${companyName}. How can I help you today?` },
        { sender: "customer", text: "I had water damage in my basement last night. I need to file a claim." },
        { sender: "system", text: "🎯 Routed to Home & Property Agent (confidence: 96%)" },
        { sender: "ai", text: "I'm sorry to hear about the water damage. I can help you file a claim right away. First, can you confirm your policy number?", agentLabel: "Home & Property" },
        { sender: "customer", text: "It's HP-2024-89412" },
        { sender: "ai", text: "Thank you. I've located your homeowner's policy. I'll need a few details to file your First Notice of Loss:\n\n1. When did the damage occur?\n2. What's the estimated extent of damage?\n3. Have you been able to stop the water source?", agentLabel: "Home & Property" },
        { sender: "customer", text: "Last night around 11pm. The basement is flooded about 2 inches. We shut off the main water valve." },
        { sender: "ai", text: "Your claim has been filed successfully.\n\n📋 Claim #HC-29481\n📅 Date of Loss: Last night\n🏠 Type: Water damage — basement\n\nNext steps:\n• An adjuster will contact you within 24 hours\n• I've sent mitigation company contacts to your email\n• You can check claim status anytime by asking me\n\nIs there anything else I can help with?", agentLabel: "Home & Property" },
      ],
    },
    banking: {
      industry: "Banking",
      title: "Account Inquiry Experience",
      messages: [
        { sender: "ai", text: `Welcome to ${companyName}. How can I assist you today?` },
        { sender: "customer", text: "I see a transaction I don't recognize on my checking account." },
        { sender: "system", text: "🎯 Routed to Billing & Payments Agent (confidence: 92%)" },
        { sender: "ai", text: "I can help you with that. For security, I'll need to verify your identity first. Could you confirm the last 4 digits of your account number?", agentLabel: "Billing" },
        { sender: "customer", text: "4829" },
        { sender: "ai", text: "Verified. I can see your recent transactions. Which one looks unfamiliar? I'll show you the last 5:\n\n• Apr 7 — $42.50 — GROCERY MART\n• Apr 6 — $185.00 — ONLINE STORE TX\n• Apr 5 — $15.99 — STREAMING SVC\n• Apr 4 — $67.30 — RESTAURANT NYC\n• Apr 3 — $2,100.00 — WIRE TRANSFER", agentLabel: "Billing" },
        { sender: "customer", text: "The $185 from ONLINE STORE TX — I didn't make that purchase." },
        { sender: "ai", text: "I've initiated a dispute for the $185.00 charge.\n\n🔒 Dispute #D-88412 opened\n💳 Provisional credit will appear within 48 hours\n📧 Dispute form sent to your email\n\nYour card has been flagged for monitoring. Would you like me to issue a replacement card as well?", agentLabel: "Billing" },
      ],
    },
    credit_union: {
      industry: "Credit Union",
      title: "Member Services Experience",
      messages: [
        { sender: "ai", text: `Welcome to ${companyName}! How can I help you today?` },
        { sender: "customer", text: "I'd like to know what my auto loan payoff amount is." },
        { sender: "system", text: "🎯 Routed to Billing & Payments Agent (confidence: 94%)" },
        { sender: "ai", text: "I can look that up for you. Let me verify your membership first. Can you confirm your member number?", agentLabel: "Billing" },
        { sender: "customer", text: "M-445289" },
        { sender: "ai", text: "Here are your auto loan details:\n\n🚗 Loan #AL-2023-445289\n💰 Payoff amount: $12,847.23 (valid through Apr 15)\n📅 Remaining term: 28 months\n📊 Rate: 4.25% APR\n\nWould you like me to send payoff instructions to your email, or is there anything else?", agentLabel: "Billing" },
      ],
    },
    wealth_management: {
      industry: "Wealth Management",
      title: "Portfolio Inquiry Experience",
      messages: [
        { sender: "ai", text: `Welcome to ${companyName}. How may I assist you?` },
        { sender: "customer", text: "I'd like to understand the performance of my portfolio this quarter." },
        { sender: "system", text: "🎯 Routed to Coverage & Policy Agent (confidence: 89%)" },
        { sender: "ai", text: "I can pull up your portfolio summary. For security, could you verify your account with the last 4 digits?", agentLabel: "Coverage" },
        { sender: "customer", text: "7731" },
        { sender: "ai", text: "Here's your Q1 2026 portfolio overview:\n\n📈 Total value: $847,200\n📊 Q1 Return: +4.2% ($34,100)\n🎯 Benchmark: +3.8%\n\nYour allocation is currently 65% equities, 30% fixed income, 5% alternatives. Would you like to schedule a review with your advisor, or explore rebalancing options?", agentLabel: "Coverage" },
      ],
    },
    fintech: {
      industry: "Fintech",
      title: "Payment Support Experience",
      messages: [
        { sender: "ai", text: `Hey! Welcome to ${companyName} support. What can I help with?` },
        { sender: "customer", text: "My payment to a vendor failed and I need it to go through today." },
        { sender: "system", text: "🎯 Routed to Billing & Payments Agent (confidence: 95%)" },
        { sender: "ai", text: "I'll look into that right away. Can you share the payment reference or the vendor name?", agentLabel: "Billing" },
        { sender: "customer", text: "Payment ref TXN-8841 to Acme Corp" },
        { sender: "ai", text: "Found it. The payment of $4,500 to Acme Corp failed due to insufficient daily limit.\n\n🔧 Fix options:\n1. I can temporarily increase your daily limit\n2. Split into two payments\n3. Schedule for tomorrow when limit resets\n\nWhich would you prefer?", agentLabel: "Billing" },
      ],
    },
    pension: {
      industry: "Pension & Retirement",
      title: "Retirement Planning Experience",
      messages: [
        { sender: "ai", text: `Welcome to ${companyName}. How can I help you today?` },
        { sender: "customer", text: "I'm turning 62 next year. What are my pension withdrawal options?" },
        { sender: "system", text: "🎯 Routed to Life & Benefits Agent (confidence: 91%)" },
        { sender: "ai", text: "Congratulations on approaching retirement! Let me pull up your pension details. Can you confirm your member ID?", agentLabel: "Life & Benefits" },
        { sender: "customer", text: "PEN-224891" },
        { sender: "ai", text: "Here's your pension overview:\n\n💰 Accumulated value: $423,500\n📅 Full retirement age: 65\n📊 Early withdrawal (age 62): Reduced by 6.7%\n\nYour options:\n1. **Lump sum** at 62 (with early reduction)\n2. **Monthly annuity** starting at 62: ~$1,850/mo\n3. **Deferred** to 65 for full benefit: ~$2,400/mo\n\nWould you like to schedule a call with a retirement specialist to discuss the tax implications?", agentLabel: "Life & Benefits" },
      ],
    },
  };

  return scripts[primary] || scripts.insurance;
}

/* ─── Second demo: Banking escalation by design ─── */
export function getEscalatedDemoScript(companyName: string): DemoScript {
  return {
    industry: "Banking",
    title: "Escalation by Design",
    messages: [
      { sender: "ai", text: `Welcome to ${companyName}. How can I assist you today?` },
      { sender: "customer", text: "I applied for a mortgage 3 weeks ago and haven't heard anything. I need an update." },
      { sender: "system", text: "🎯 Routed to Lending & Mortgages Agent (confidence: 94%)" },
      { sender: "ai", text: "I can help with that. Let me verify your identity first. Could you confirm your application reference number?", agentLabel: "Lending & Mortgages" },
      { sender: "customer", text: "MA-2024-55210" },
      { sender: "ai", text: "Thank you. I've located your mortgage application.\n\n📋 Application #MA-2024-55210\n📅 Submitted: March 21, 2026\n📊 Status: Underwriting — additional review\n\nYour application has been flagged for additional income verification due to multiple income sources. This type of case requires a mortgage specialist to guide you through the next steps.", agentLabel: "Lending & Mortgages" },
      { sender: "system", text: "🔄 Transferring to live agent — Mortgage Specialist" },
      { sender: "ai", text: "I'm connecting you with a mortgage specialist who can walk you through exactly what documentation is needed and help expedite your application.\n\n⏱ Estimated wait: under 2 minutes\n📎 Full conversation history shared\n\nThey'll have all the context from our chat so you won't need to repeat anything.", agentLabel: "Lending & Mortgages" },
    ],
  };
}
