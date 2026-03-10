export const updateNewEmailTemplate = (ticket) => {
  return `

<h2>Your Ticket Has Been Updated</h2>

<p>
Your support ticket has been updated with the following details:
</p>

<p>
<strong>Title:</strong><br>
${ticket.title}
</p>

<p>
<strong>Summary:</strong><br>
${ticket.summary}
</p>

<p>
<strong>Status:</strong><br>
${ticket.status}
</p>

<p>
Our team will continue reviewing your request and will get back to you if further updates are available.
</p>

<br>

<p>
Best regards,<br>
CEiVoice Support Team
</p>
  `;
};
