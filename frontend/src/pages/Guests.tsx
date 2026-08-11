import { useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GuestTab from "@/components/guests/tabs/guests/GuestTab"
import GroupTab from "@/components/guests/tabs/groups/GroupTab"
import TableTab from "@/components/guests/tabs/tables/TableTab"
import { getWeddingId } from "@/lib/auth"

export default function GuestsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") ?? "guests"
  const weddingId = getWeddingId() ?? "";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center bg-background text-foreground">
      <section className="animate-rise mb-6 w-full max-w-7xl rounded-3xl border bg-card p-6 shadow-sm md:p-8">
        <div className="border-l-2 border-primary/60 pl-5 md:pl-6">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">Personas</p>
          <h1 className="mt-2 text-3xl md:text-4xl">Invitados de la boda</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Gestiona invitados y acompañantes, organízalos en grupos y distribúyelos por mesas.
          </p>
        </div>
      </section>
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full max-w-7xl">
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
          <TableTab weddingId={weddingId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
