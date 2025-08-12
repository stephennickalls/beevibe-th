<template>
  <div class="max-w-6xl mx-auto p-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Hubs</h1>
      <div class="flex items-center gap-2">
        <input v-model="q" type="search" placeholder="Search hubs…" class="input input-bordered w-64" />
        <button class="btn" @click="openCreate()">Add Hub</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <select v-model="filter" class="select select-bordered">
        <option value="all">All</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
        <option value="unassigned">Unassigned</option>
      </select>
      <select v-model="apiaryFilter" class="select select-bordered">
        <option :value="null">All apiaries</option>
        <option v-for="a in apiaries" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>
    </div>

    <!-- List -->
    <div class="rounded-2xl border overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-4 py-3">Hub</th>
            <th class="text-left px-4 py-3">Apiary</th>
            <th class="text-left px-4 py-3">Last seen</th>
            <th class="text-left px-4 py-3">Firmware</th>
            <th class="text-left px-4 py-3">Health</th>
            <th class="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in filtered" :key="h.id" class="border-t">
            <td class="px-4 py-3">
              <div class="font-medium">{{ h.name }}</div>
              <div class="text-xs text-muted-foreground">UUID: {{ h.uuid || '—' }}</div>
            </td>
            <td class="px-4 py-3">
              <div v-if="h.apiary">{{ h.apiary.name }}</div>
              <div v-else class="text-muted-foreground">Unassigned</div>
            </td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 rounded-full text-xs mr-2', isOnline(h) ? 'bg-green-100' : 'bg-gray-100']">
                {{ isOnline(h) ? 'Online' : 'Offline' }}
              </span>
              <span class="text-muted-foreground">{{ lastSeenLabel(h.last_seen) }}</span>
            </td>
            <td class="px-4 py-3">{{ h.firmware_version || '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 text-xs text-muted-foreground">
                <span v-if="h.telemetry?.battery_level != null">🔋 {{ h.telemetry.battery_level }}%</span>
                <span v-if="h.telemetry?.rssi != null">📶 RSSI {{ h.telemetry.rssi }}</span>
                <span v-if="h.telemetry?.voltage != null">⚡ {{ h.telemetry.voltage }}V</span>
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex gap-2">
                <button class="btn btn-sm" @click="openAssign(h)">{{ h.apiary ? 'Reassign' : 'Assign' }}</button>
                <button class="btn btn-sm" @click="openCommand(h)">Commands</button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && !filtered.length">
            <td colspan="6" class="px-4 py-10 text-center text-muted-foreground">No hubs found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Hub Modal -->
    <dialog ref="createDlg" class="modal">
      <form method="dialog" class="modal-box w-full max-w-md">
        <h3 class="font-semibold text-lg mb-4">Add Hub</h3>
        <div class="space-y-3">
          <label class="block">
            <span class="text-sm">Name</span>
            <input v-model="createForm.name" class="input input-bordered w-full" placeholder="e.g. Garden Gateway" />
          </label>
          <label class="block">
            <span class="text-sm">Description</span>
            <textarea v-model="createForm.description" class="textarea textarea-bordered w-full" />
          </label>
          <label class="block">
            <span class="text-sm">Apiary (optional)</span>
            <select v-model="createForm.apiary_id" class="select select-bordered w-full">
              <option :value="null">Unassigned</option>
              <option v-for="a in apiaries" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
          </label>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="btn btn-ghost">Cancel</button>
          <button class="btn" @click.prevent="submitCreate">Create</button>
        </div>
      </form>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>

    <!-- Assign Modal -->
    <dialog ref="assignDlg" class="modal">
      <form method="dialog" class="modal-box w-full max-w-sm">
        <h3 class="font-semibold text-lg mb-4">Assign Hub</h3>
        <div class="space-y-3">
          <div class="text-sm">Hub: <span class="font-medium">{{ selected?.name }}</span></div>
          <label class="block">
            <span class="text-sm">Apiary</span>
            <select v-model="assignApiaryId" class="select select-bordered w-full">
              <option v-for="a in apiaries" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
          </label>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="btn btn-ghost">Cancel</button>
          <button class="btn" @click.prevent="submitAssign">Assign</button>
        </div>
      </form>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>

    <!-- Command Modal (lightweight placeholder) -->
    <dialog ref="cmdDlg" class="modal">
      <form method="dialog" class="modal-box w-full max-w-sm">
        <h3 class="font-semibold text-lg mb-2">Send Command</h3>
        <div class="text-sm mb-3">Hub: <span class="font-medium">{{ selected?.name }}</span></div>
        <label class="block mb-3">
          <span class="text-sm">Type</span>
          <select v-model="cmd.type" class="select select-bordered w-full">
            <option value="PING">PING</option>
            <option value="REBOOT">REBOOT</option>
            <option value="OTA_UPDATE">OTA_UPDATE</option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm">Payload (JSON)</span>
          <textarea v-model="cmd.payloadRaw" rows="5" class="textarea textarea-bordered w-full" placeholder='{"rate":60}' />
        </label>
        <div class="flex justify-end gap-2 mt-4">
          <button class="btn btn-ghost">Cancel</button>
          <button class="btn" @click.prevent="submitCommand">Send</button>
        </div>
      </form>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()

const loading = ref(true)
const hubs = ref<any[]>([])
const apiaries = ref<any[]>([])

const q = ref('')
const filter = ref<'all'|'online'|'offline'|'unassigned'>('all')
const apiaryFilter = ref<number|null>(null)

const createDlg = ref<HTMLDialogElement | null>(null)
const assignDlg = ref<HTMLDialogElement | null>(null)
const cmdDlg = ref<HTMLDialogElement | null>(null)

const selected = ref<any|null>(null)
const assignApiaryId = ref<number|undefined>()

const createForm = ref<{ name: string; description: string | null; apiary_id: number | null }>({ name: '', description: null, apiary_id: null })

const cmd = ref<{ type: string; payloadRaw: string }>({ type: 'PING', payloadRaw: '{}' })

function isOnline(h: any) {
  return !!h.last_seen && Date.now() - new Date(h.last_seen).getTime() < 5 * 60 * 1000
}
function lastSeenLabel(dt?: string | null) {
  if (!dt) return 'Never'
  const ms = Date.now() - new Date(dt).getTime()
  const min = Math.round(ms/60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min/60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.round(hr/24)
  return `${d}d ago`
}

const filtered = computed(() => {
  let list = hubs.value
  if (q.value) {
    const qq = q.value.toLowerCase()
    list = list.filter(h => h.name.toLowerCase().includes(qq) || (h.uuid || '').toLowerCase().includes(qq))
  }
  if (apiaryFilter.value) list = list.filter(h => h.apiary_id === apiaryFilter.value)
  if (filter.value === 'online') list = list.filter(h => isOnline(h))
  if (filter.value === 'offline') list = list.filter(h => !isOnline(h))
  if (filter.value === 'unassigned') list = list.filter(h => !h.apiary_id)
  return list
})

async function load() {
  loading.value = true
  // hubs with joined apiary and latest telemetry (1 row via rpc)
  const { data: hubData, error: hubErr } = await supabase
    .from('apiary_hubs')
    .select('*, apiaries:apiary_id(id, name)')
    .order('last_seen', { ascending: false, nullsFirst: true })
  if (hubErr) throw hubErr

  // augment with a single latest telemetry point (optional — omit if no RLS yet)
  const ids = (hubData || []).map(h => h.id)
  let telemetryById: Record<number, any> = {}
  if (ids.length) {
    const { data: tdata } = await supabase
      .from('device_telemetry')
      .select('*')
      .in('device_id', ids)
      .eq('device_type', 'HUB')
      .order('recorded_at', { ascending: false })
      .limit(1, { foreignTable: undefined }) // client-side reduce
    // reduce manually to latest per hub
    (tdata || []).forEach(row => {
      if (!telemetryById[row.device_id]) telemetryById[row.device_id] = row
    })
  }

  hubs.value = (hubData || []).map((h: any) => ({
    ...h,
    apiary: h.apiaries || null,
    telemetry: telemetryById[h.id] || null
  }))

  const { data: apiaryData, error: apiErr } = await supabase
    .from('apiaries')
    .select('id, name')
    .order('name')
  if (apiErr) throw apiErr
  apiaries.value = apiaryData || []

  loading.value = false
}

function openCreate() {
  createForm.value = { name: '', description: null, apiary_id: null }
  createDlg.value?.showModal()
}

async function submitCreate() {
  // If you created the RPC create_hub, use it; else fall back to direct insert
  if (createForm.value.apiary_id) {
    const { data, error } = await supabase.rpc('create_hub', {
      p_apiary_id: createForm.value.apiary_id,
      p_name: createForm.value.name,
      p_description: createForm.value.description
    })
    if (error) throw error
  } else {
    // Unassigned hub: direct insert with NULL apiary_id (requires nullable FK)
    const { error } = await supabase
      .from('apiary_hubs')
      .insert({ name: createForm.value.name, description: createForm.value.description, apiary_id: null })
    if (error) throw error
  }
  createDlg.value?.close()
  await load()
}

function openAssign(h: any) {
  selected.value = h
  assignApiaryId.value = h.apiary_id || (apiaries.value[0]?.id)
  assignDlg.value?.showModal()
}

async function submitAssign() {
  if (!selected.value || !assignApiaryId.value) return
  const { error } = await supabase
    .from('apiary_hubs')
    .update({ apiary_id: assignApiaryId.value })
    .eq('id', selected.value.id)
  if (error) throw error
  assignDlg.value?.close()
  await load()
}

function openCommand(h: any) {
  selected.value = h
  cmd.value = { type: 'PING', payloadRaw: '{}' }
  cmdDlg.value?.showModal()
}

async function submitCommand() {
  if (!selected.value) return
  let payload: any = {}
  try { payload = JSON.parse(cmd.value.payloadRaw || '{}') } catch {}
  const { error } = await supabase.rpc('send_hub_command', {
    p_hub_id: selected.value.id,
    p_type: cmd.value.type,
    p_payload: payload
  })
  if (error) throw error
  cmdDlg.value?.close()
}

onMounted(load)
</script>
