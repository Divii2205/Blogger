jest.mock("../repositories/postRepository", () => ({
  findAuthorByUsername: jest.fn(),
  findPosts: jest.fn(),
  countPosts: jest.fn(),
  findPostById: jest.fn(),
  findRawPostById: jest.fn(),
  createPost: jest.fn(),
  populateAuthor: jest.fn(),
  deletePostById: jest.fn(),
  incrementUserPostCount: jest.fn(),
  findUserFollowing: jest.fn(),
}));

const postRepository = require("../repositories/postRepository");
const postService = require("../services/postService");

const makePost = (overrides = {}) => ({
  toObject: () => ({ _id: "p1", likesCount: 2, ...overrides }),
  isLikedBy: jest.fn(() => true),
});

describe("postService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists published posts with pagination", async () => {
    postRepository.findPosts.mockResolvedValue([makePost()]);
    postRepository.countPosts.mockResolvedValue(1);

    const result = await postService.listPublishedPosts(
      { page: "1", limit: "10", sortBy: "publishedAt" },
      { _id: "u1" }
    );

    expect(postRepository.findPosts).toHaveBeenCalled();
    expect(result.posts).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it("throws not found for unknown post id", async () => {
    postRepository.findPostById.mockResolvedValue(null);
    await expect(postService.getPostById("missing", null)).rejects.toThrow("Post not found");
  });
});
