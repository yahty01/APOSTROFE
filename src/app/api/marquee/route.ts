import {NextResponse} from 'next/server';

import {createSupabasePublicClient} from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createSupabasePublicClient();
    const {data, error} = await supabase
      .from('settings_marquee')
      .select('enabled,text_ru,text_en,speed,direction')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        {enabled: false, text_ru: '', text_en: '', speed: null, direction: null},
        {headers: {'cache-control': 'no-store'}}
      );
    }

    return NextResponse.json(data, {headers: {'cache-control': 'no-store'}});
  } catch {
    return NextResponse.json(
      {enabled: false, text_ru: '', text_en: '', speed: null, direction: null},
      {headers: {'cache-control': 'no-store'}}
    );
  }
}

