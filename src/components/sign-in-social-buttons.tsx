import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { useMutation } from "@tanstack/react-query";
import { ENV } from "varlock/env";

import { Button } from "#/components/ui/button.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { authClient } from "#/lib/auth/auth-client.ts";

interface SocialLoginButtonProps {
  provider: string;
  icon: React.ReactNode;
  disabled?: boolean;
  callbackURL: string;
}

function SignInSocialButton(props: SocialLoginButtonProps) {
  const providerLabel =
    props.provider === "github"
      ? "GitHub"
      : props.provider.charAt(0).toUpperCase() + props.provider.slice(1);

  const mutation = useMutation({
    mutationFn: async () =>
      await authClient.signIn.social(
        {
          provider: props.provider,
          callbackURL: props.callbackURL,
        },
        {
          onError: ({ error }) => {
            toast.add({
              type: "error",
              description: error.message || `An error occurred during ${providerLabel} sign-in.`,
            });
          },
        },
      ),
  });

  return (
    <Button
      variant="outline"
      className="w-full"
      size="lg"
      type="button"
      disabled={mutation.isSuccess || mutation.isPending || props.disabled}
      onClick={() => mutation.mutate()}
    >
      {props.icon}
      Continue with {providerLabel}
    </Button>
  );
}

export function SocialSignInButtons({
  callbackURL,
  disabled,
}: Pick<SocialLoginButtonProps, "callbackURL" | "disabled">) {
  // TODO: Remove this. This is just for the demo deployment of Cove Stack, which this project is based on.
  const isPreviewDeployment = new URL(ENV.VITE_BASE_URL).origin === "https://cove.mugnavo.com";

  return (
    <>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">Or</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SignInSocialButton
          provider="github"
          callbackURL={callbackURL}
          disabled={disabled}
          icon={<SiGithub className="size-4" />}
        />
        <SignInSocialButton
          provider="google"
          callbackURL={callbackURL}
          disabled={disabled || isPreviewDeployment}
          icon={<SiGoogle className="size-4" />}
        />
      </div>
    </>
  );
}
