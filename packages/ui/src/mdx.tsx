import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Info,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/accordion";
import { Alert, AlertDescription, AlertTitle } from "./components/alert";
import { Badge } from "./components/badge";
import { Button } from "./components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/card";
import { Checkbox } from "./components/checkbox";
import { Input } from "./components/input";
import { Label } from "./components/label";
import { Progress } from "./components/progress";
import { ScrollArea } from "./components/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/select";
import { Separator } from "./components/separator";
import { Skeleton } from "./components/skeleton";
import { Switch } from "./components/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs";

export const mdxComponents = {
  // Base HTML overrides (standard for docs)
  h1: (props: any) => (
    <h1 className="mb-4 text-3xl font-bold tracking-tight" {...props} />
  ),
  h2: (props: any) => (
    <h2
      className="mt-10 mb-4 border-b pb-2 text-2xl font-bold tracking-tight"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3 className="mt-8 mb-4 text-xl font-bold tracking-tight" {...props} />
  ),
  p: (props: any) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
  ),
  ul: (props: any) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: (props: any) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  li: (props: any) => <li className="mt-2" {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className="border-primary text-muted-foreground mt-6 border-l-2 pl-6 italic"
      {...props}
    />
  ),
  code: ({ inline, className, children, ...props }: any) => {
    return inline ? (
      <code
        className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code {...props}>{children}</code>
    );
  },
  pre: (props: any) => (
    <pre
      className="mt-6 mb-4 overflow-x-auto rounded-lg border bg-zinc-950 p-4 font-mono text-sm leading-6 text-white"
      {...props}
    />
  ),
  table: ({ children }: any) => (
    <div className="my-6 w-full overflow-y-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-muted border-b font-bold">{children}</thead>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border-t px-4 py-3 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </td>
  ),
  tr: ({ children }: any) => (
    <tr className="even:bg-muted/50 m-0">{children}</tr>
  ),

  // UI Components
  Button,
  Link,
  Badge,
  Separator,
  Skeleton,
  Progress,
  Input,
  Switch,
  Checkbox,
  Label,
  ScrollArea,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,

  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,

  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,

  // Icons
  Zap,
  BookOpen,
  GraduationCap,
  Users,
  Clock,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,

  // Custom MDX-only Components
  Callout: ({ children, type = "info" }: any) => {
    const icons: any = {
      info: Info,
      success: CheckCircle2,
      warning: AlertTriangle,
      danger: XCircle,
    };
    const Icon = icons[type] || Info;
    const styles: any = {
      info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
      success:
        "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
      warning:
        "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
      danger:
        "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
    };
    return (
      <div className={`my-6 flex gap-4 rounded-xl border p-4 ${styles[type]}`}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="text-sm leading-6 [&>p]:mt-0">{children}</div>
      </div>
    );
  },
};

export type MDXComponents = typeof mdxComponents;
