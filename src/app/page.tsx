import { redirect } from 'next/navigation';

/** Accueil = login uniquement (pas de landing / explications). */
export default function HomePage() {
  redirect('/login');
}
