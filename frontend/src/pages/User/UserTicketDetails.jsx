// ─── Imports ─────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import UserNavbar from "@/components/UserNavbar";
import api from "@/api/axios";


// ─── Component ───────────────────────────────────────────────────────────────
export default function UserTicketDetails() {
 // ── Navigation & Route Params ──────────────────────────────────────────────
 const navigate = useNavigate();
 const { routeTicketId } = useParams();
 const location = useLocation();
 const ticketId = decodeURIComponent(routeTicketId || location.state?.ticketId || "");
 const initialTicket = location.state?.ticket || null;


 // ── Ticket Data State ──────────────────────────────────────────────────────
 const [ticket, setTicket] = useState(initialTicket);
 const [followersCount, setFollowersCount] = useState(0);


 // ── Comment State (public only for users) ──────────────────────────────────
 const [publicComments, setPublicComments] = useState([]);
 const [commentText, setCommentText] = useState("");


 // ── UI State ───────────────────────────────────────────────────────────────
 const [loading, setLoading] = useState(true);
 const [commentSubmitting, setCommentSubmitting] = useState(false);
 const [errorMessage, setErrorMessage] = useState("");
 const [commentError, setCommentError] = useState("");


 // ── Current User Info ──────────────────────────────────────────────────────
 const user = JSON.parse(localStorage.getItem("user") || "{}");
 const userEmail = user?.email || "user@gmail.com";


 // ─── Helper Functions ──────────────────────────────────────────────────────


 /** Returns a display label for a user value (object, string, or null). */
 const getUserLabel = (value, fallback = "-") => {
   if (!value) return fallback;
   if (typeof value === "object") return value?.name || value?.email || fallback;
   return String(value);
 };


 /** Extracts the sender display name from a comment object. */
 const getCommentSender = (comment) => {
   const commentUser = comment?.user;
   if (commentUser && typeof commentUser === "object") {
     if (commentUser.name) return commentUser.name;
     if (commentUser.email) return commentUser.email;
   }
   if (typeof commentUser === "string") return commentUser;
   return comment?.email || comment?.senderEmail || comment?.name || "Unknown user";
 };


 /** Formats a deadline date string for display. */
 const formatDeadline = (deadline) => {
   if (!deadline) return "-";
   const date = new Date(deadline);
   if (Number.isNaN(date.getTime())) return deadline;
   return date.toLocaleDateString();
 };


 // ─── Data Fetching ─────────────────────────────────────────────────────────


 /** Fetches ticket details and public comments on mount. */
 useEffect(() => {
   const fetchTicketAndComments = async () => {
     if (!ticketId) {
       setErrorMessage("Missing ticket id.");
       setLoading(false);
       return;
     }


     try {
       setErrorMessage("");
       const response = await api.get(`/user/ticketDetails/${encodeURIComponent(ticketId)}`);
       const ticketData = response.data.ticket;


       if (!ticketData) {
         setErrorMessage("Ticket details request returned no ticket.");
         return;
       }


       setTicket(ticketData);


       // Merge API-level public comments with embedded ticket.comments
       const apiPublic = Array.isArray(response.data.publicComments) ? response.data.publicComments : [];


       const embedded = Array.isArray(ticketData.comments) ? ticketData.comments : [];
       const embeddedPublic = embedded.filter((c) => c.type === "Public" || c.visibility === "Public");


       setPublicComments([...apiPublic, ...embeddedPublic].sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)));


       // Follower count comes from a raw .lean() query to avoid populate issues
       setFollowersCount(response.data.followersCount ?? 0);
       setCommentError("");
     } catch (error) {
       console.error("Error fetching ticket and comments:", error);
       setErrorMessage(error?.response?.data?.message || "Failed to load ticket details.");
     } finally {
       setLoading(false);
     }
   };


   fetchTicketAndComments();
 }, [ticketId]);


 // ─── Computed / Derived Values ─────────────────────────────────────────────


 // Creator display – fall back to the email prefix if the user object isn't populated
 const creatorFallback = ticket?.email ? ticket.email.split("@")[0] : "-";
 const creatorText = getUserLabel(ticket?.creator, creatorFallback);


 const followersText = `${followersCount} user${followersCount !== 1 ? 's' : ''}`;


 const assigneesText = Array.isArray(ticket?.assignees)
   ? ticket.assignees.map((a) => a?.name || a?.email || 'Unknown').join(", ")
   : "-";


 /** Key-value pairs rendered in the ticket info section. */
 const details = [
   { label: "Title", value: ticket?.title || "-" },
   { label: "Category", value: ticket?.category || "-" },
   { label: "Deadline", value: formatDeadline(ticket?.deadline) },
   { label: "Creator", value: creatorText },
   { label: "Followers", value: followersText },
   { label: "Assignees", value: assigneesText },
 ];


 // ─── Event Handlers ────────────────────────────────────────────────────────


 /** Posts a new public comment on this ticket. */
 const handleSubmitComment = async () => {
   const message = commentText.trim();
   if (!message) return;


   setCommentSubmitting(true);
   setCommentError("");


   try {
     const response = await api.post("/user/submitComment", {
       ticketId: ticket?._id || ticketId,
       commentText: message,
     });


     // Build the new comment object for optimistic UI update
     const newComment = {
       ...response.data.comment,
       user: {
         email: userEmail,
         name: response.data.name || user?.name,
       },
       role: response.data.role || user?.role || "user",
       visibility: "Public",
     };


     setPublicComments((prev) => [...prev, newComment]);
     setCommentText("");
   } catch (error) {
     console.error("Error submitting comment:", error);
     setCommentError(error?.response?.data?.message || "Failed to submit comment.");
   } finally {
     setCommentSubmitting(false);
   }
 };


 // ─── JSX Render ───────────────────────────────────────────────────────────
 return (
   <div className="min-h-screen bg-gray-200">
     {/* ── Top Navigation ──────────────────────────────────────────────────── */}
     <UserNavbar />


     {/* ── Main Content Area ───────────────────────────────────────────────── */}
     <div className="max-w-5xl mx-auto mt-6 px-4 pb-8">
       <div className="bg-gray-100 border border-gray-300 rounded-xl shadow-sm overflow-hidden">
         <div className="p-6">
           {/* Back button */}
           <button
             onClick={() => navigate("/track")}
             className="text-orange-500 text-sm hover:text-orange-600 mb-3"
           >
             ← Back
           </button>


           <h1 className="text-xl font-semibold mb-4">
             {ticket?.title || ticket?._id || "Ticket-001"}
           </h1>


           {loading ? (
             <p className="text-gray-600 text-sm">Loading ticket...</p>
           ) : (
             <>
               {/* Error banner */}
               {errorMessage && (
                 <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                   {errorMessage}
                 </div>
               )}


               {/* ── Ticket Details ────────────────────────────────────────── */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm">
                 {details.map((item) => (
                   <p key={item.label}>
                     <span className="font-semibold">{item.label}:</span> {item.value}
                   </p>
                 ))}


                 {/* Issue spans both columns */}
                 <p className="md:col-span-2">
                   <span className="font-semibold">Issue:</span> {ticket?.issue || "-"}
                 </p>
               </div>
             </>
           )}
         </div>


         {/* ── Comments Section (public only) ──────────────────────────────── */}
         <div className="border-t border-gray-300 p-6">
           <div className="flex items-center justify-between mb-3">
             <h2 className="text-lg font-semibold">Comments</h2>
             <span className="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-700">
               Public only
             </span>
           </div>


           {/* Comment list */}
           <div className="border border-orange-400 bg-gray-100 rounded-xl p-4 h-[240px] overflow-y-auto">
             {publicComments.length === 0 ? (
               <p className="text-gray-500 text-sm">No public comments yet.</p>
             ) : (
               publicComments.map((comment, index) => {
                 const sender = getCommentSender(comment);
                 const role = comment?.user?.role || comment?.role || comment?.senderRole || "Unknown";


                 // Align own comments to the right, others to the left
                 const isUser =
                   sender.toLowerCase() === String(userEmail).toLowerCase() ||
                   sender.toLowerCase() === String(user?.name || "").toLowerCase();


                 return (
                   <div
                     key={comment?._id || comment?.id || index}
                     className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}
                   >
                     <div className="max-w-[65%]">
                       <p className="text-xs text-gray-700 mb-1">
                         {sender} | {role}
                       </p>
                       <div className="bg-gray-300 rounded px-3 py-2 text-sm">
                         {comment?.comment || comment?.message}
                       </div>
                     </div>
                   </div>
                 );
               })
             )}
           </div>


           {/* Comment error message */}
           {commentError && (
             <p className="mt-3 text-sm text-red-600">{commentError}</p>
           )}


           {/* Comment input bar: text input + submit */}
           <div className="mt-4 flex items-center">
             <input
               type="text"
               value={commentText}
               onChange={(e) => setCommentText(e.target.value)}
               placeholder="Enter the comment to post it"
               className="flex-1 border border-orange-400 rounded-l-lg px-3 py-2 text-sm outline-none"
             />


             <button
               onClick={handleSubmitComment}
               disabled={commentSubmitting || !ticket}
               className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-r-lg text-sm"
             >
               {commentSubmitting ? "Submitting..." : "Submit"}
             </button>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}



