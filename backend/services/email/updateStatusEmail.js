export const updateStatusEmailTemplate = (ticket) => {
  return `

    <h2>Your Ticket Has Been Updated</h2>
    <br>
    <p>Title: ${ticket.title}</p>
    <p>Summary: ${ticket.summary}</p>
    <p>Status: ${ticket.status}</p>
    <br>
    <p>We will get back to you as soon as possible.</p>
    <p>
    Best regards,<br>
    CEiVoice Support Team
    </p>
  `;
};