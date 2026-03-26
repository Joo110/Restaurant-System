import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createBranch, type CreateBranchDTO } from "../services/branchService";

type Props = {
  onClose: () => void;
  onCreated?: () => void; // optional callback to tell parent to refetch
};

type FieldErrors = {
  name?: string | null;
  street?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  general?: string | null;
} & {
  // index signature to allow dynamic keys safely (avoids need for @ts-ignore)
  [key: string]: string | null | undefined;
};

export default function AddBranchModal({ onClose, onCreated }: Props) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});

  // --- validation helpers ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Egyptian mobile pattern: 010,011,012,015 + 8 more digits = 11 digits total
  const egyptPhoneDigitsRegex = /^01[0125]\d{8}$/;

  const normalizePhone = (p: string) => p.replace(/\s|-/g, "");

  const validateName = (v: string) => {
    if (!v || !v.trim()) return t("nameIsRequired");
    if (v.trim().length > 100) return t("nameTooLong");
    return null;
  };

  const validateStreet = (v: string) => {
    if (v && v.trim().length > 120) return t("streetTooLong");
    return null;
  };

  const validateCity = (v: string) => {
    if (!v || !v.trim()) return t("cityIsRequired");
    if (v.trim().length > 80) return t("cityTooLong");
    return null;
  };

  const validateCountry = (v: string) => {
    if (!v || !v.trim()) return t("countryIsRequired");
    if (v.trim().length > 80) return t("countryTooLong");
    return null;
  };

  const validatePhone = (v: string) => {
    if (!v || !v.trim()) return t("phoneIsRequired");
    const digits = normalizePhone(v).replace(/\D/g, "");
    if (!egyptPhoneDigitsRegex.test(digits)) return t("phoneInvalidEgyptian");
    return null;
  };

  const validateEmail = (v: string) => {
    if (!v || !v.trim()) return t("emailIsRequired");
    if (!emailRegex.test(v.trim())) return t("emailInvalid");
    if (v.trim().length > 120) return t("emailTooLong");
    return null;
  };

  const validateNotes = (v: string) => {
    if (v && v.length > 500) return t("notesTooLong");
    return null;
  };

  const validateField = (field: keyof FieldErrors, value?: string) => {
    switch (field) {
      case "name":
        return validateName(value ?? name);
      case "street":
        return validateStreet(value ?? street);
      case "city":
        return validateCity(value ?? city);
      case "country":
        return validateCountry(value ?? country);
      case "phone":
        return validatePhone(value ?? phone);
      case "email":
        return validateEmail(value ?? email);
      case "notes":
        return validateNotes(value ?? notes);
      default:
        return null;
    }
  };

  const validateAll = (): boolean => {
    const newErrors: FieldErrors = {};
    newErrors.name = validateName(name);
    newErrors.street = validateStreet(street);
    newErrors.city = validateCity(city);
    newErrors.country = validateCountry(country);
    newErrors.phone = validatePhone(phone);
    newErrors.email = validateEmail(email);
    newErrors.notes = validateNotes(notes);

    // remove nulls — typed access avoids @ts-ignore
    Object.keys(newErrors).forEach((k) => {
      const key = k as keyof FieldErrors;
      if (newErrors[key] == null) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- event handlers ---
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrors({});
    if (!validateAll()) return;

    const payload: CreateBranchDTO = {
      name: name.trim(),
      address: {
        street: street.trim(),
        city: city.trim(),
        country: country.trim(),
      },
      phone: normalizePhone(phone).replace(/\D/g, ""),
      email: email.trim(),
      notes: notes.trim(),
    };

    try {
      setIsSubmitting(true);
      await createBranch(payload);
      if (onCreated) onCreated();
      onClose();
    } catch (err: unknown) {
      // server side validation handling (common shapes)
      // safely read response data without using `any`
      const serverMsg = (err as { response?: { data?: unknown } })?.response?.data;

      const newErrors: FieldErrors = {};

      if (serverMsg && typeof serverMsg === "object" && !Array.isArray(serverMsg)) {
        const sm = serverMsg as Record<string, unknown>;

        // shape: { errors: { email: '...' } }
        if (sm.errors && typeof sm.errors === "object" && !Array.isArray(sm.errors)) {
          const errs = sm.errors as Record<string, unknown>;
          Object.entries(errs).forEach(([k, v]) => {
            newErrors[k] = typeof v === "string" ? v : JSON.stringify(v);
          });
        } else {
          // maybe { message: '...', email: '...' }
          if ("message" in sm && typeof sm.message === "string") {
            newErrors.general = sm.message;
          }
          ["name", "phone", "email", "street", "city", "country", "notes"].forEach((k) => {
            if (k in sm) {
              const v = sm[k];
              newErrors[k] = typeof v === "string" ? v : JSON.stringify(v);
            }
          });
        }
      } else if (typeof serverMsg === "string") {
        newErrors.general = serverMsg;
      } else {
        // fallback to error message if available
        if (err instanceof Error) newErrors.general = err.message;
        else newErrors.general = t("failedToCreateBranch");
      }

      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  // small helpers to render input classes with error highlighting
  const inputBase = "w-full rounded-xl px-3 py-2 text-sm outline-none border ";
  const inputNormal = inputBase + "border-gray-100";
  const inputError = inputBase + "border-red-300 ring-1 ring-red-200";

  return (
    // overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* modal */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t("addNewBranch")}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">{t("name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setErrors((s) => ({ ...s, name: validateField("name") }))}
              className={errors.name ? inputError : inputNormal}
              placeholder={t("namePlaceholder")}
              maxLength={100}
              required
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">{t("street")}</label>
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                onBlur={() => setErrors((s) => ({ ...s, street: validateField("street") }))}
                className={errors.street ? inputError : inputNormal}
                placeholder={t("streetPlaceholder")}
                maxLength={120}
              />
              {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">{t("city")}</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onBlur={() => setErrors((s) => ({ ...s, city: validateField("city") }))}
                className={errors.city ? inputError : inputNormal}
                placeholder={t("cityPlaceholder")}
                maxLength={80}
                required
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">{t("country")}</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onBlur={() => setErrors((s) => ({ ...s, country: validateField("country") }))}
                className={errors.country ? inputError : inputNormal}
                placeholder={t("countryPlaceholder")}
                maxLength={80}
                required
              />
              {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">{t("phone")}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setErrors((s) => ({ ...s, phone: validateField("phone") }))}
                className={errors.phone ? inputError : inputNormal}
                placeholder={t("phonePlaceholder")}
                maxLength={20}
                required
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">{t("email")}</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setErrors((s) => ({ ...s, email: validateField("email") }))}
                className={errors.email ? inputError : inputNormal}
                placeholder={t("emailPlaceholder")}
                type="email"
                maxLength={120}
                required
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">{t("notes")}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => setErrors((s) => ({ ...s, notes: validateField("notes") }))}
              className={errors.notes ? inputError : inputNormal}
              rows={3}
              placeholder={t("notesPlaceholder")}
              maxLength={500}
            />
            {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes}</p>}
          </div>

          {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-semibold"
              disabled={isSubmitting}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("creating") : t("createBranch")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}