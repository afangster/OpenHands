import { GitRepository } from "#/types/git";
import { extractNextPageFromLink } from "#/utils/extract-next-page-from-link";
import { openHands } from "./open-hands-axios";

/**
 * Retrieves repositories where OpenHands Github App has been installed
 * @param installationIndex Pagination cursor position for app installation IDs
 * @param installations Collection of all App installation IDs for OpenHands Github App
 * @returns A list of repositories
 */
export const retrieveGitHubAppRepositories = async (
  installationIndex: number,
  installations: number[],
  page = 1,
  per_page = 30,
) => {
  const installationId = installations[installationIndex];
  const response = await openHands.get<GitRepository[]>(
    "/api/user/repositories",
    {
      params: {
        sort: "pushed",
        page,
        per_page,
        installation_id: installationId,
      },
    },
  );

  const link =
    response.data.length > 0 && response.data[0].link_header
      ? response.data[0].link_header
      : "";

  const nextPage = extractNextPageFromLink(link);
  let nextInstallation: number | null;

  if (nextPage) {
    nextInstallation = installationIndex;
  } else if (installationIndex + 1 < installations.length) {
    nextInstallation = installationIndex + 1;
  } else {
    nextInstallation = null;
  }

  return {
    data: response.data,
    nextPage,
    installationIndex: nextInstallation,
  };
};

/**
 * Given a PAT, retrieves the repositories of the user
 * @returns A list of repositories
 */
export const retrieveUserGitRepositories = async () => {
  const response = await openHands.get<GitRepository[]>(
    "/api/user/repositories",
    {
      params: {
        sort: "pushed",
      },
    },
  );

  // Check if any provider has more results
  const link =
    response.data.length > 0 && response.data[0].link_header
      ? response.data[0].link_header
      : "";
  const nextPage = extractNextPageFromLink(link);

  return { data: response.data, nextPage };
};
