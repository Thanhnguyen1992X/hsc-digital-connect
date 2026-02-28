import type { Employee } from "@/data/mockEmployees";

export function generateVCard(employee: Employee): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${employee.full_name}`,
    `ORG:${employee.company_name};${employee.department}`,
    `TITLE:${employee.position}`,
    `TEL;TYPE=WORK,VOICE:${employee.phone}`,
    `EMAIL;TYPE=WORK:${employee.email}`,
  ];

  if (employee.website_url) lines.push(`URL:${employee.website_url}`);
  if (employee.avatar_url) lines.push(`PHOTO;TYPE=JPEG;ENCODING=URL:${employee.avatar_url}`);
  if (employee.address) lines.push(`ADR;TYPE=WORK:;;${employee.address};;;;`);

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function downloadVCard(employee: Employee) {
  const vcf = generateVCard(employee);
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${employee.full_name.replace(/\s+/g, "_")}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
