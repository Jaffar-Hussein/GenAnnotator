import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface GeneResponse {
  genes: string[];
  count: number;
  next: string | null;
  previous: string | null;
  error?: string;
}
interface User {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
}
interface UserResponse {
  users: User[];
  error?: string;
}

interface FetchUsersParams {
  role?: string;
}
interface AnnotationGroup {
  count: number;
  annotation: string[];
}

interface Stats {
  annotations: number;
  ongoing: AnnotationGroup;
  pending: AnnotationGroup;
  approved: AnnotationGroup;
  rejected: AnnotationGroup;
}

export type UserStatsResponse = {
  data?: Stats;
  error?: string;
};

// Api call for fetching a list of all genes that are not annotated
export async function fetchRawGenes({ limit = 10 }): Promise<GeneResponse> {
  const store = useAuthStore.getState();
  const accessToken = store.accessToken;
  try {
    const response = await fetch(
      `${API_URL}/data/api/status/?status=RAW&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return {
        genes: [],
        count: 0,
        next: null,
        previous: null,
        error: `Error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    const processedData: GeneResponse = {
      genes: data.results.map((item: { gene: string }) => item.gene),
      count: data.count,
      previous: data.previous,
      next: data.next,
    };

    return processedData;
  } catch (error) {
    return {
      genes: [],
      count: 0,
      next: null,
      previous: null,
      error: "Fetch error: " + (error as Error).message,
    };
  }
}
// Api call for fetching a next list of genes that are not annotated
export async function fetchNextGenes(nextUrl: string): Promise<GeneResponse> {
  const store = useAuthStore.getState();
  const accessToken = store.accessToken;
  if (!nextUrl) {
    return {
      genes: [],
      count: 0,
      next: null,
      previous: null,
      error: "No next page URL provided",
    };
  }

  try {
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return {
        genes: [],
        count: 0,
        next: null,
        previous: null,
        error: `Error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    const processedData: GeneResponse = {
      genes: data.results.map((item: { gene: string }) => item.gene),
      count: data.count,
      previous: data.previous,
      next: data.next,
    };

    return processedData;
  } catch (error) {
    return {
      genes: [],
      count: 0,
      next: null,
      previous: null,
      error: "Fetch error: " + (error as Error).message,
    };
  }
}

// APi call for getting a list of Users according to their roles
export async function fetchUsers({ role }: FetchUsersParams = {}): Promise<
  UserResponse[]
> {
  const store = useAuthStore.getState();
  const accessToken = store.accessToken;
  try {
    const params = new URLSearchParams({
      limit: "1000",
    });


    const response = await fetch(
      `${API_URL}/access/api/user/?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return [
        {
          users: [],
          error: `Error: ${response.status} ${response.statusText}`,
        },
      ];
    }

    const data = await response.json();

    const processedData = data.results.map((item: User) => ({
      username: item.username,
      first_name: item.first_name,
      last_name: item.last_name,
      email: item.email,
      role: item.role,
    }));
    if (role) {
      return processedData.filter((item: User) => item.role === role || item.role === "VALIDATOR");
    }
    return processedData;
  } catch (error) {
    return [
      {
        users: [],
        error: "Fetch error: " + (error as Error).message,
      },
    ];
  }
}

//   Get users statistics
export async function fetchUsersStats({
  username,
}: {
  username: string;
}): Promise<UserStatsResponse> {
  const store = useAuthStore.getState();
  const accessToken = store.accessToken;

  try {
    const response = await fetch(
      `${API_URL}/data/api/stats/?user=${username}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return {
        error: `Error: ${response.status} ${response.statusText}`,
      };
    }

    const data: Stats = await response.json();

    return { data };
  } catch (error) {
    return {
      error: "Fetch error: " + (error as Error).message,
    };
  }
}

export async function assignGeneToUser({ user, genes }) {
  const store = useAuthStore.getState();
  const accessToken = store.accessToken;
  try {
    const response = await fetch(`${API_URL}/data/api/status/`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "setuser",
        user: user,
        gene: genes,
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error);
    }

    return await response.json();
  } catch (error) {
    throw new Error((error as Error).message);
   
  }
}
