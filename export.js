import * as XLSX from 'xlsx';

export async function onRequestGet({ env }) {
  try {
    const row = await env.DB.prepare('SELECT state_json FROM app_state WHERE id = 1').first();
    const state = row?.state_json ? JSON.parse(row.state_json) : { metrics: [] };
    const rows = [['ชื่อ KPI','หน่วย','Target หลัก','วันที่','Act','Target Dynamic','สีแท่งกราฟ','หมายเหตุ']];
    for (const metric of (state.metrics || [])) {
      for (const record of (metric.records || [])) {
        rows.push([metric.name, metric.unit, metric.target, record.date, record.act, record.target, record.color || '', record.note || '']);
      }
    }
    const kpiRows = [['ชื่อ KPI','หน่วย','Target หลัก','สี Act เริ่มต้น','จำนวนวัน']];
    for (const metric of (state.metrics || [])) kpiRows.push([metric.name, metric.unit, metric.target, metric.color, (metric.records || []).length]);
    const workbook = XLSX.utils.book_new();
    const daily = XLSX.utils.aoa_to_sheet(rows);
    daily['!cols'] = [{wch:32},{wch:16},{wch:16},{wch:16},{wch:14},{wch:18},{wch:18},{wch:40}];
    daily['!autofilter'] = { ref: XLSX.utils.encode_range({s:{r:0,c:0},e:{r:Math.max(rows.length-1,0),c:7}}) };
    daily['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };
    XLSX.utils.book_append_sheet(workbook, daily, 'KPI รายวัน');
    const kpis = XLSX.utils.aoa_to_sheet(kpiRows);
    kpis['!cols'] = [{wch:36},{wch:18},{wch:18},{wch:20},{wch:16}];
    XLSX.utils.book_append_sheet(workbook, kpis, 'รายการ KPI');
    const bytes = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Response(bytes, { headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="OH_Daily_KPI.xlsx"',
      'Cache-Control': 'no-store'
    }});
  } catch (error) {
    return Response.json({ error: 'ส่งออก Excel ไม่สำเร็จ', detail: String(error) }, { status: 500 });
  }
}
