"use client"

import * as React from "react"
import { Building2, ChevronDown } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface Domain {
  id: string
  name: string
  type: "freeswitch" | "enterprise" | "demo"
  status: "active" | "inactive"
}

const mockDomains: Domain[] = [
  { id: "acs-main", name: "ACS Platform", type: "enterprise", status: "active" },
  { id: "customer-1", name: "Acme Corp", type: "freeswitch", status: "active" },
  { id: "customer-2", name: "TechStart Inc", type: "freeswitch", status: "active" },
  { id: "customer-3", name: "Global Solutions", type: "freeswitch", status: "active" },
  { id: "demo", name: "Demo Environment", type: "demo", status: "active" },
]

interface DomainSelectorProps {
  onDomainChange?: (domain: Domain) => void
}

export function DomainSelector({ onDomainChange }: DomainSelectorProps) {
  const [selectedDomain, setSelectedDomain] = React.useState<Domain>(mockDomains[0])

  const handleDomainSelect = (domain: Domain) => {
    setSelectedDomain(domain)
    onDomainChange?.(domain)
    localStorage.setItem("acs-selected-domain", JSON.stringify(domain))
  }

  React.useEffect(() => {
    const savedDomain = localStorage.getItem("acs-selected-domain")
    if (savedDomain) {
      try {
        const domain = JSON.parse(savedDomain)
        setSelectedDomain(domain)
        onDomainChange?.(domain)
      } catch (error) {
        console.error("Failed to parse saved domain:", error)
      }
    }
  }, [onDomainChange])

  const getStatusColor = (status: string) => {
    return status === "active" ? "text-green-500" : "text-red-500"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "enterprise":
        return "🏢"
      case "freeswitch":
        return "📞"
      case "demo":
        return "🧪"
      default:
        return "🏢"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between bg-transparent">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{selectedDomain.name}</span>
            <span className="text-xs">{getTypeIcon(selectedDomain.type)}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Select Customer Domain</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mockDomains.map((domain) => (
          <DropdownMenuItem
            key={domain.id}
            onClick={() => handleDomainSelect(domain)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span>{getTypeIcon(domain.type)}</span>
              <div className="flex flex-col">
                <span className="font-medium">{domain.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{domain.type}</span>
              </div>
            </div>
            <div className={`text-xs ${getStatusColor(domain.status)}`}>●</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
