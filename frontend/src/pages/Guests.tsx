import { useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GuestTab from "@/components/guests/tabs/guests/GuestTab"
import GroupTab from "@/components/guests/tabs/groups/GroupTab"
import TableTab from "@/components/guests/tabs/tables/TableTab"

export default function GuestsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") ?? "guests"

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center bg-background text-foreground">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="guests">Invitados</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="tables">Mesas</TabsTrigger>
        </TabsList>

        <TabsContent value="guests">
          <GuestTab />
        </TabsContent>
        <TabsContent value="groups">
          <GroupTab />
        </TabsContent>
        <TabsContent value="tables">
          <TableTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
