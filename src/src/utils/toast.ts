import { toast } from "react-toastify";
import Swal from "sweetalert2";

export function success(msg: string) {
  toast.success(msg);
}

export function error(msg: string) {
  toast.error(msg);
}

export function warning(msg: string) {
  toast.warning(msg);
}

export function info(msg: string) {
  toast.info(msg);
}

export async function confirm(
  title: string,
  text: string
): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
  });

  return result.isConfirmed;
}