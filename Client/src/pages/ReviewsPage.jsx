import useFetch from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";

function StarRating(props) {
  var rating = props.rating;
  var stars = "";
  for (var i = 1; i <= 5; i++) {
    stars += i <= rating ? "★" : "☆";
  }
  return <span className="text-yellow-400 text-sm">{stars}</span>;
}

export default function ReviewsPage() {
  var auth = useAuth();
  var user = auth.user;
  var userId = user ? user._id : null;

  var fetchResult = useFetch(userId ? "/reviews/user/" + userId : null);
  var data = fetchResult.data;
  var loading = fetchResult.loading;
  var error = fetchResult.error;

  var reviews = [];
  var averageRating = 0;
  if (data) {
    reviews = data.reviews || [];
    averageRating = data.averageRating || 0;
  }

  function renderContent() {
    if (loading) {
      return <div className="text-center text-muted text-sm py-16">Loading reviews...</div>;
    }
    if (error) {
      return (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </div>
      );
    }
    if (reviews.length === 0) {
      return <div className="text-center text-muted text-sm py-16">No reviews yet.</div>;
    }
    return (
      <div className="space-y-3">
        {reviews.map(function(r) {
          var reviewerName = r.reviewer ? r.reviewer.username : "Anonymous";
          return (
            <div key={r._id} className="bg-card border border-line rounded-2xl px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white text-sm font-medium">{reviewerName}</p>
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="text-muted text-xs leading-relaxed">{r.comment}</p>
                </div>
                <div className="shrink-0">
                  <p className="text-white font-display font-bold text-lg">{r.rating + "/5"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-display text-2xl font-bold text-white">Reviews</h3>
        <p className="text-muted text-sm mt-0.5">{reviews.length + " total"}</p>
      </div>

      <div className="bg-card border border-line rounded-2xl px-5 py-4 mb-6">
        <p className="text-muted text-xs uppercase tracking-wider mb-1">Average Rating</p>
        <div className="flex items-center gap-3">
          <p className="text-white font-display text-3xl font-bold">{averageRating}</p>
          <StarRating rating={Math.round(averageRating)} />
        </div>
      </div>

      {renderContent()}
    </div>
  );
}