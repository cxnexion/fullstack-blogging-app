import { Button } from '@/components/ui/button.tsx'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group.tsx'
import ModeToggle from '@/components/ModeToggle.tsx'
import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { authClient } from '@/lib/auth-client.ts'
import { Spinner } from '@/components/ui/spinner.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'

const Header = () => {
  const {
    data: session,
    isPending,
  } = authClient.useSession();

  return (
    <header className="flex items-center justify-between p-2 border-b sticky top-0 z-50 bg-background">
      <div className="flex sm:flex-1">
        <Link to="/" className="text-2xl">
          Blogg<span className="text-primary">Ing</span>
        </Link>
      </div>
      <div className="gap-4 hidden lg:flex">
        <Link
          to="/write"
          className="content-center hover:decoration-foreground underline decoration-transparent transition"
        >
          Write
        </Link>
        <a
          href=""
          className="content-center hover:decoration-foreground underline decoration-transparent transition"
        >
          About Us
        </a>
        <a
          href=""
          className="content-center hover:decoration-foreground underline decoration-transparent transition"
        >
          Contact Us
        </a>
        <a
          href=""
          className="content-center hover:decoration-foreground underline decoration-transparent transition"
        >
          Membership
        </a>
      </div>
      <div className="flex gap-2 justify-end flex-1">
        <InputGroup className="w-8 focus-within:w-1/2 sm:w-1/2 transition-all duration-100 ease-in">
          <InputGroupInput className="" placeholder="Search..." />
          <InputGroupAddon>
            <Search className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
        <ModeToggle />
        <Link disabled={isPending} to={session?.user ? '/profile' : '/auth/register'}>
          {
            <Button
              size={session?.user ? 'icon' : 'default'}
              variant={
                isPending ? 'secondary' : session?.user ? 'outline' : 'default'
              }
            >
              {isPending ? <Spinner /> : session?.user ? <Avatar><AvatarImage src={session.user.image ?? undefined}/><AvatarFallback className="truncate">{session.user.name}</AvatarFallback></Avatar> : 'Sign Up'}
            </Button>
          }
        </Link>
      </div>
    </header>
  )
}

export default Header
