export const confirmationEmailTemplate = (issue) => {
  return `

<h2>Your Issue Has Been Reported</h2>

<p>
Thank you for contacting the CEiVoice Support Team.
</p>

<p>
<strong>Reported Issue:</strong><br>
${issue}
</p>

<p>
Our team has received your request and will review it shortly.  
We will get back to you as soon as possible.
</p>

<br>

<p>
Best regards,<br>
CEiVoice Support Team
</p>
  `;
};