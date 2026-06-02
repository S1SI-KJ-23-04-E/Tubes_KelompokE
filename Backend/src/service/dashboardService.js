import { supabaseAdmin } from "../lib/supabase.js";

export const getPerformanceDashboardService =
  async () => {

    // ambil laporan
    const {
      data: laporanData,
      error: laporanError,
    } = await supabaseAdmin
      .from("laporan")
      .select("*");

    if (laporanError) {
      throw laporanError;
    }

    // ambil master kecamatan
    const {
      data: kecamatanData,
      error: kecamatanError,
    } = await supabaseAdmin
      .from("kecamatan")
      .select("*");

    if (kecamatanError) {
      throw kecamatanError;
    }

    // mapping uuid -> nama kecamatan
    const kecamatanMap = {};

    kecamatanData.forEach((kecamatan) => {
      kecamatanMap[kecamatan.id] =
        kecamatan.nama_kecamatan;
    });

    const groupedData = {};

    laporanData.forEach((laporan) => {

      // hanya laporan selesai
      if (laporan.status !== "done") {
        return;
      }

      const kecamatan =
        kecamatanMap[
          laporan.kecamatan_id
        ] || "Unknown";

      const createdAt = new Date(
        laporan.created_at
      );

      const selesaiAt =
        laporan.selesai_at
          ? new Date(
              laporan.selesai_at
            )
          : new Date(
              laporan.updated_at
            );

      const durationHours =
        (selesaiAt - createdAt) /
        (1000 * 60 * 60);

      if (!groupedData[kecamatan]) {
        groupedData[kecamatan] = {
          total_laporan: 0,
          total_duration: 0,
        };
      }

      groupedData[kecamatan]
        .total_laporan += 1;

      groupedData[kecamatan]
        .total_duration +=
        durationHours;
    });

    const result = Object.keys(
      groupedData
    ).map((kecamatan) => ({
      kecamatan,

      total_laporan:
        groupedData[kecamatan]
          .total_laporan,

      avg_duration_hours: Number(
        (
          groupedData[kecamatan]
            .total_duration /
          groupedData[kecamatan]
            .total_laporan
        ).toFixed(2)
      ),
    }));

    result.sort(
      (a, b) =>
        b.total_laporan -
        a.total_laporan
    );

    return result;
  };