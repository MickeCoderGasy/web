// Composant pour le lien admin (masqué dans la navigation normale)
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { isAdminEmail } from '@/config/admin';

export function AdminLink() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Afficher le lien admin seulement si l'utilisateur est autorisé
  if (!user || !isAdminEmail(user.email)) {
    return null;
  }

  return (
    <DropdownMenuItem onClick={() => navigate("/admin-payments")} className="cursor-pointer">
      <Shield className="mr-2 h-4 w-4" />
      <span>Administration</span>
    </DropdownMenuItem>
  );
}
