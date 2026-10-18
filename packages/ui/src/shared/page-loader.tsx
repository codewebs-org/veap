import { Spinner } from "../components/spinner";
import { Logo } from "../logo";

interface PageLoaderProps {
  withLogo?: boolean;
  text?: string;
}

export function PageLoader({ withLogo = true, text }: PageLoaderProps) {
  return (
    <div className="bg-background absolute inset-0 flex flex-col items-center justify-center space-y-6">
      {withLogo && (
        <div className="mb-6">
          <Logo />
        </div>
      )}

      <Spinner />

      {text && <div className="text-xs lowercase">{text}</div>}
    </div>
  );
}
