import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

type Guest = {
  name: string
  group: string
  color: string
}

type Props = {
  guests: Guest[]
  assignedGuests: Guest[]
  selectedGuest: Guest | null
  onSelect: (guest: Guest) => void
}

export function GuestList({ guests, assignedGuests, selectedGuest, onSelect }: Props) {
  // Agrupar invitados por grupo
  const groupedGuests = guests.reduce((acc, guest) => {
    if (!acc[guest.group]) acc[guest.group] = []
    acc[guest.group].push(guest)
    return acc
  }, {} as Record<string, Guest[]>)

  const [openGroups, setOpenGroups] = useState<string[]>([])

  const toggleGroup = (group: string) => {
    setOpenGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    )
  }

  return (
    <div className="w-72 bg-white rounded shadow p-4 space-y-4">
      <h3 className="text-lg font-semibold">Invitados por grupo</h3>
      {Object.entries(groupedGuests).map(([group, groupGuests]) => (
        <div key={group}>
          <button
            className="flex items-center w-full text-left font-medium text-primary mb-1"
            onClick={() => toggleGroup(group)}
          >
            {openGroups.includes(group) ? <ChevronDown className="mr-1 w-4 h-4" /> : <ChevronRight className="mr-1 w-4 h-4" />}
            {group}
          </button>
          {openGroups.includes(group) && (
            <ul className="pl-4 space-y-1">
              {groupGuests.map(guest => {
                const isAssigned = assignedGuests.includes(guest)

                return (
                  <li
                    key={guest.name}
                    onClick={() => !isAssigned && onSelect(guest)}
                    className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center gap-2 transition ${selectedGuest?.name === guest.name
                        ? "bg-primary text-white"
                        : isAssigned
                          ? "opacity-50 line-through cursor-not-allowed"
                          : "hover:bg-muted"
                      }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${guest.color}`} />
                    {guest.name}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
