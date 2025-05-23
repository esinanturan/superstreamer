import { toParams } from "@superstreamer/api/client";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { z } from "zod";
import { AutoRefresh } from "../../../../components/AutoRefresh";
import { Format } from "../../../../components/Format";
import { FullTable } from "../../../../components/FullTable";
import { JobState } from "../../../../components/JobState";

export const Route = createFileRoute("/(dashboard)/_layout/jobs/")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(
    z.object({
      page: z.coerce.number().default(1),
      perPage: z.coerce.number().default(20),
      sortKey: z.enum(["name", "duration", "createdAt"]).default("createdAt"),
      sortDir: z.enum(["asc", "desc"]).default("desc"),
      query: z.string().default(""),
    }),
  ),
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ deps, context }) => {
    const { api } = context.api;
    const response = await api.jobs.$get({ query: toParams(deps) });
    return {
      jobs: await response.json(),
    };
  },
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { jobs } = Route.useLoaderData();

  return (
    <div className="p-8">
      <div className="mb-4 flex gap-4">
        <h2 className="font-medium">Jobs</h2>
        <AutoRefresh interval={5} defaultEnabled />
      </div>
      <FullTable
        columns={[
          {
            id: "state",
            label: "",
            className: "w-4",
          },
          {
            id: "name",
            label: "Name",
            allowsSorting: true,
          },

          {
            id: "duration",
            label: "Duration",
            allowsSorting: true,
          },
          {
            id: "createdAt",
            label: "Created",
            allowsSorting: true,
          },
        ]}
        totalPages={jobs.totalPages}
        items={jobs.items}
        filter={jobs.filter}
        onFilterChange={(search) => {
          navigate({ search });
        }}
        mapRow={(item) => ({
          key: item.id,
          cells: [
            <JobState key="1" job={item} />,
            <Link key="2" to="/jobs/$id" params={{ id: item.id }}>
              <div className="font-medium">{item.name}</div>
              <Format className="text-xs" format="short-id" value={item.id} />
            </Link>,
            <Format key="3" format="duration" value={item.duration} />,
            <Format key="4" format="date" value={item.createdAt} />,
          ],
        })}
      />
    </div>
  );
}
