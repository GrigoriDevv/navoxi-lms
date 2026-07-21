"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  roleLabels,
  roleDescriptions,
  unitLabels,
  isConfirmedRole,
  hasPermission,
} from "@/lib/rbac";
import { shouldHidePath } from "@/lib/mock-module-gates";
import { useApp } from "@/lib/store";
import { Icon } from "@/components/Icon";
import { Avatar, Badge } from "@/components/ui";
import { DropdownPanel } from "@/components/DropdownPanel";

export function UserMenu() {
  const router = useRouter();
  const { currentUser, logout } = useApp();

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const menuItems = [
    { label: "Meu perfil", href: "/perfil", icon: "user" },
    { label: "Preferências", href: "/preferencias", icon: "cog" },
    ...(hasPermission(currentUser.role, "manage_global_settings") &&
    !shouldHidePath("/configuracoes")
      ? [{ label: "Configurações da plataforma", href: "/configuracoes", icon: "cog" }]
      : []),
    ...(hasPermission(currentUser.role, "manage_identity")
      ? [{ label: "Identidade & Acesso", href: "/identidade", icon: "shield" }]
      : []),
    { label: "Central de ajuda", href: "#", icon: "help" },
  ];

  return (
    <DropdownPanel
      width="w-72"
      trigger={({ open, toggle }) => (
        <button
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
        >
          <Avatar
            name={currentUser.name}
            color={currentUser.avatarColor}
            size={34}
          />
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-sm font-medium text-slate-800 max-w-[140px] truncate">
              {currentUser.name}
            </div>
            <div className="text-xs text-slate-500 max-w-[140px] truncate">
              {roleLabels[currentUser.role]}
            </div>
          </div>
          <Icon
            name="chevron"
            className={`w-4 h-4 text-slate-400 hidden sm:block transition ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}
    >
      <div className="p-4 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <Avatar name={currentUser.name} color={currentUser.avatarColor} size={40} />
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 truncate">{currentUser.name}</div>
            <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge color={isConfirmedRole(currentUser.role) ? "green" : "slate"}>
            {roleLabels[currentUser.role]}
          </Badge>
          <Badge color="blue">{unitLabels[currentUser.unitId]}</Badge>
          {currentUser.authProvider === "microsoft" && (
            <Badge color="slate">Microsoft verificado</Badge>
          )}
        </div>
        <p className="mt-2 text-[11px] text-slate-500 leading-snug">
          {roleDescriptions[currentUser.role]}
        </p>
      </div>

      <ul className="py-1">
        {menuItems.map((item) => (
          <li key={item.label}>
            {item.href === "#" ? (
              <span className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed">
                <Icon name={item.icon} className="w-4 h-4" />
                {item.label}
                <span className="ml-auto text-[10px]">em breve</span>
              </span>
            ) : (
              <Link
                href={item.href}
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <Icon name={item.icon} className="w-4 h-4 text-slate-400" />
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-100 p-1">
        <button
          role="menuitem"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Icon name="logout" className="w-4 h-4" />
          Sair da plataforma
        </button>
      </div>
    </DropdownPanel>
  );
}
