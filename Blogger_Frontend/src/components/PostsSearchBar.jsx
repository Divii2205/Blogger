import React, { useEffect, useState } from "react";
import { usePopularTagsQuery } from "../features/posts/hooks/usePostQueries";

// Debounce typing so we don't refetch on every keystroke. 350ms feels
// snappy enough that the user perceives it as live, but coalesces a typed
// word into one request.
const useDebouncedValue = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
};

const PostsSearchBar = ({ query, tag, onChange, placeholder = "Search posts by title..." }) => {
  const [localQuery, setLocalQuery] = useState(query || "");
  const debouncedQuery = useDebouncedValue(localQuery);
  const { data: tags = [] } = usePopularTagsQuery({ limit: 12 });

  useEffect(() => {
    if (debouncedQuery !== query) {
      onChange({ q: debouncedQuery, tag });
    }
  }, [debouncedQuery]);

  const handleTagClick = (next) => {
    onChange({ q: localQuery, tag: next === tag ? "" : next });
  };

  const handleClear = () => {
    setLocalQuery("");
    onChange({ q: "", tag: "" });
  };

  const hasFilters = Boolean(localQuery || tag);

  return (
    <div className="space-y-3 mb-6">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Clear
          </button>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => {
            const active = t.tag === tag;
            return (
              <button
                key={t.tag}
                type="button"
                onClick={() => handleTagClick(t.tag)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  active
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-primary-500"
                }`}
              >
                #{t.tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostsSearchBar;
