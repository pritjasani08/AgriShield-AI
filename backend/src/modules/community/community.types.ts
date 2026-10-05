export interface CommunityPostDto {
  id: string;
  userId: string;
  userName?: string; // Hydrated from users table
  content: string;
  animalType?: string;
  distance?: string;
  side?: string;
  imageUrl?: string;
  likesCount: number;
  isLikedByMe?: boolean;
  createdAt: Date;
}

export interface CreateCommunityPostDto {
  content: string;
  animalType?: string;
  distance?: string;
  side?: string;
  imageUrl?: string;
}
