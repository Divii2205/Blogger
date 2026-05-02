import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usersAPI } from "../utils/api";
import Avatar from "./ui/Avatar";

// Simple modal that lists followers or following for a given username.
// Lazy-fetches the list on open via the existing /users/:username/followers
// and /following endpoints (already populated with avatar/fullName/counts).
const FollowersModal = ({ open, onClose, username, mode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !username) return undefined;
    let cancelled = false;
    const fetcher = mode === "following" ? usersAPI.getFollowing : usersAPI.getFollowers;

    setLoading(true);
    setError("");
    fetcher(username)
      .then((res) => {
        if (cancelled) return;
        const list = mode === "following"
          ? res.data.data.following
          : res.data.data.followers;
        setUsers(list || []);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load list. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, username, mode]);

  if (!open) return null;

  const title = mode === "following" ? "Following" : "Followers";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-sm text-red-600 dark:text-red-400 p-6">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 p-6">
              {mode === "following" ? "Not following anyone yet." : "No followers yet."}
            </p>
          ) : (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {users.map((u) => (
                <li key={u._id}>
                  <Link
                    to={`/profile/${u.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <Avatar src={u.avatar} alt={u.fullName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {u.fullName}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        @{u.username}
                      </p>
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                      {u.followersCount || 0} followers
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
