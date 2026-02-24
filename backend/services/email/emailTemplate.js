export const ticketEmailTemplate = (issue) => {
  return `

    <h2>Your Issue Has Been Reported</h2>
    <br>
    <p>Issue: ${issue}</p>
    <br>
    <p>We will get back to you as soon as possible.</p>
    <p>
    Best regards,<br>
    CEiVoice Support Team
    </p>
  `;
};