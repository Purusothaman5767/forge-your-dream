import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ReviewSection({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews(data || []);
    if (user) {
      const mine = (data || []).find(r => r.user_id === user.id);
      if (mine) {
        setUserReview(mine);
        setRating(mine.rating);
        setComment(mine.comment || '');
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [productId, user]);

  const handleSubmit = async () => {
    if (!user) { toast.error('Please log in to review'); return; }
    if (rating === 0) { toast.error('Select a rating'); return; }
    setSubmitting(true);
    if (userReview) {
      await supabase.from('reviews').update({ rating, comment }).eq('id', userReview.id);
    } else {
      await supabase.from('reviews').insert({ user_id: user.id, product_id: productId, rating, comment });
    }
    toast.success(userReview ? 'Review updated!' : 'Review submitted!');
    setSubmitting(false);
    fetchReviews();
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="bg-card border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Write review */}
      {user && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">{userReview ? 'Update your review' : 'Write a review'}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i)}
              >
                <Star className={`h-5 w-5 transition-colors ${i <= (hoverRating || rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
          />
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : userReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
