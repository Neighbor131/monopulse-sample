import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { REVIEWS, buildReviewFromDraft } from '../data/reviews';
import type { Review } from '../data/reviews';
import type { DraftCampaign } from './CampaignContext';

interface ReviewCounts {
  pending: number;
  blocked: number;
  changes: number;
  reset: number;
  approvedToday: number;
  queue: number;
}

interface ReviewsCtx {
  reviews: Review[];
  counts: ReviewCounts;
  submitForApproval: (draft: DraftCampaign) => Review;
  resubmit: (id: string) => void;
  getReviewById: (id: string) => Review | undefined;
}

const Ctx = createContext<ReviewsCtx | null>(null);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);

  const submitForApproval = (draft: DraftCampaign): Review => {
    const review = buildReviewFromDraft(draft);
    setReviews((prev) => [review, ...prev]);
    return review;
  };

  const resubmit = (id: string) =>
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, decision: 'pending', submittedAt: 'just now' } : r))
    );

  const getReviewById = (id: string) => reviews.find((r) => r.id === id);

  const counts = useMemo<ReviewCounts>(
    () => ({
      pending: reviews.filter((r) => r.decision === 'pending').length,
      blocked: reviews.filter((r) => r.decision === 'blocked').length,
      changes: reviews.filter((r) => r.decision === 'changes_requested').length,
      reset: reviews.filter((r) => r.decision === 'reset').length,
      approvedToday: reviews.filter((r) => r.decision === 'approved').length,
      queue: reviews.filter((r) => ['pending', 'blocked', 'reset'].includes(r.decision)).length,
    }),
    [reviews]
  );

  return (
    <Ctx.Provider value={{ reviews, counts, submitForApproval, resubmit, getReviewById }}>
      {children}
    </Ctx.Provider>
  );
}

export function useReviews(): ReviewsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
