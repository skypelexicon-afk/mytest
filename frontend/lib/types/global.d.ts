export {};

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            context?: 'signup' | 'signin';
          }) => void;
          prompt: () => void;
          renderButton: (
            parent: HTMLElement | null,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
            }
          ) => void;
        };
      };
    };
  }

  interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
  }
}
