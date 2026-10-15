import type { Device } from "@prisma/client";
import { saveDevice } from "@/app/admin/actions";
import { DEVICE_STATUSES, label } from "@/lib/ticket-config";
import { ErrorBanner, Field, inputClass, primaryButton } from "./form-ui";

/** Shared add/edit form for a device. Pass `device` to edit, omit to add. */
export default function DeviceForm({
  householdId,
  customerName,
  device,
  error,
}: {
  householdId: string;
  customerName: string;
  device?: Device;
  error?: string;
}) {
  return (
    <form action={saveDevice} className="rounded-xl2 border border-mist bg-white p-6">
      <ErrorBanner message={error} />
      {device && <input type="hidden" name="id" value={device.id} />}
      <input type="hidden" name="householdId" value={householdId} />

      <p className="mb-5 text-ink/70">
        Customer: <span className="font-semibold text-ink">{customerName}</span>
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nickname" htmlFor="name" hint={'Something you\'ll recognize, like "Mom\'s Dell".'}>
          <input id="name" name="name" required maxLength={100} defaultValue={device?.name ?? ""} className={inputClass} />
        </Field>

        <Field
          label="RustDesk ID"
          htmlFor="rustdeskId"
          hint="ID only. Never save a RustDesk password here. Ask the customer for the one-time code each session."
        >
          <input
            id="rustdeskId"
            name="rustdeskId"
            inputMode="numeric"
            autoComplete="off"
            defaultValue={device?.rustdeskId ?? ""}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field label="Manufacturer" htmlFor="manufacturer">
          <input id="manufacturer" name="manufacturer" defaultValue={device?.manufacturer ?? ""} className={inputClass} />
        </Field>
        <Field label="Model" htmlFor="model">
          <input id="model" name="model" defaultValue={device?.model ?? ""} className={inputClass} />
        </Field>

        <Field label="Operating system" htmlFor="os">
          <input id="os" name="os" placeholder="Windows" defaultValue={device?.os ?? ""} className={inputClass} />
        </Field>
        <Field label="OS version" htmlFor="osVersion">
          <input id="osVersion" name="osVersion" placeholder="11 23H2" defaultValue={device?.osVersion ?? ""} className={inputClass} />
        </Field>

        <Field label="CPU" htmlFor="cpu">
          <input id="cpu" name="cpu" placeholder="Intel Core i5-1135G7" defaultValue={device?.cpu ?? ""} className={inputClass} />
        </Field>
        <Field label="Serial number" htmlFor="serialNumber">
          <input id="serialNumber" name="serialNumber" defaultValue={device?.serialNumber ?? ""} className={inputClass} />
        </Field>

        <Field label="RAM (GB)" htmlFor="ramGb">
          <input id="ramGb" name="ramGb" type="number" min={1} defaultValue={device?.ramGb ?? ""} className={inputClass} />
        </Field>
        <Field label="Storage (GB)" htmlFor="storageGb">
          <input id="storageGb" name="storageGb" type="number" min={1} defaultValue={device?.storageGb ?? ""} className={inputClass} />
        </Field>

        <Field label="Antivirus" htmlFor="antivirus">
          <input id="antivirus" name="antivirus" placeholder="Windows Defender" defaultValue={device?.antivirus ?? ""} className={inputClass} />
        </Field>
        <Field label="Backup" htmlFor="backupStatus">
          <input id="backupStatus" name="backupStatus" placeholder="OneDrive, external drive, none…" defaultValue={device?.backupStatus ?? ""} className={inputClass} />
        </Field>

        <Field label="Warranty ends" htmlFor="warrantyEndsAt">
          <input
            id="warrantyEndsAt"
            name="warrantyEndsAt"
            type="date"
            defaultValue={device?.warrantyEndsAt ? device.warrantyEndsAt.toISOString().slice(0, 10) : ""}
            className={inputClass}
          />
        </Field>
        <Field label="Health status" htmlFor="status">
          <select id="status" name="status" defaultValue={device?.status ?? "UNKNOWN"} className={inputClass}>
            {DEVICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Notes" htmlFor="notes" hint="Quirks, installed software, what's been fixed. No passwords.">
          <textarea id="notes" name="notes" rows={5} maxLength={4000} defaultValue={device?.notes ?? ""} className={inputClass} />
        </Field>
      </div>

      <div className="mt-6">
        <button type="submit" className={primaryButton}>
          {device ? "Save changes" : "Add device"}
        </button>
      </div>
    </form>
  );
}
