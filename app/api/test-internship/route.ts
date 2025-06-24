import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const testEmails = [
    {
      name: "Job Announcement",
      content: `Subject: Summer 2024 Software Engineering Internship - Google
From: careers@google.com
Date: 2024-01-15

We're excited to announce our Summer 2024 Software Engineering Internship program!

Join us for an amazing 12-week internship where you'll work on real projects that impact millions of users worldwide.

Apply now at careers.google.com/internships

Best regards,
Google Careers Team`
    },
    {
      name: "Application Confirmation",
      content: `Subject: Application Received - Software Engineering Intern
From: noreply@microsoft.com
Date: 2024-01-20

Dear John Doe,

Thank you for your application for the Software Engineering Intern position at Microsoft. We have received your application and it is currently under review.

Our team will review your application and get back to you within 2-3 weeks with next steps.

Best regards,
Microsoft Careers Team`
    },
    {
      name: "Interview Invitation",
      content: `Subject: Interview Invitation - Software Engineering Intern
From: interviews@amazon.com
Date: 2024-02-01

Dear John Doe,

Congratulations! We would like to invite you for an interview for the Software Engineering Intern position at Amazon.

Please schedule your interview at your earliest convenience through our scheduling portal.

Best regards,
Amazon Recruiting Team`
    },
    {
      name: "Rejection Letter",
      content: `Subject: Application Status Update
From: careers@apple.com
Date: 2024-02-15

Dear John Doe,

Thank you for your interest in the Software Engineering Intern position at Apple and for taking the time to interview with us.

After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.

We wish you the best in your future endeavors.

Best regards,
Apple Careers Team`
    },
    {
      name: "Offer Letter",
      content: `Subject: Congratulations! Offer for Software Engineering Intern
From: offers@meta.com
Date: 2024-03-01

Dear John Doe,

Congratulations! We are pleased to offer you the Software Engineering Intern position at Meta.

Please review the attached offer letter and respond within 7 days.

We look forward to having you join our team!

Best regards,
Meta Recruiting Team`
    }
  ];

  const results = [];

  for (const testEmail of testEmails) {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/internship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testEmail.content })
      });

      const data = await response.json();
      
      results.push({
        testName: testEmail.name,
        result: data,
        success: true
      });

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      results.push({
        testName: testEmail.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }
  }
    
  return NextResponse.json({
    testResults: results,
    totalTests: testEmails.length
  });
} 