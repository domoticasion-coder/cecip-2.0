import { supabase, db } from "../db";
import { NewsItem } from "../../src/types";

export class NoticiasRepository {
  public async getAll(): Promise<NewsItem[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("noticias_web")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("[NoticiasRepository] Error fetching noticias from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapFromDb);
    }
    return db.getState().noticias;
  }

  public async getById(id: string): Promise<NewsItem | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("noticias_web")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[NoticiasRepository] Error fetching noticia ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = db.getState().noticias.find((n) => n.id === id);
    return found || null;
  }

  public async create(noticia: Omit<NewsItem, "id"> & { id?: string }): Promise<NewsItem> {
    const id = noticia.id || crypto.randomUUID();
    const item: NewsItem = {
      ...noticia,
      id,
      date: noticia.date || new Date().toISOString().split("T")[0],
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("noticias_web")
        .insert({
          id: item.id,
          title: item.title,
          date: item.date,
          category: item.category,
          badge: item.badge,
          description: item.description,
          additional_info: item.additionalInfo || "",
          image_url: item.imageUrl,
          items_list: item.itemsList || [],
          publicada: true,
        })
        .select()
        .single();

      if (error) {
        console.error("[NoticiasRepository] Error creating noticia in Supabase:", error);
        throw new Error(error.message);
      }
      return this.mapFromDb(data);
    }

    const state = db.getState();
    state.noticias.unshift(item);
    db.save();
    return item;
  }

  public async update(id: string, updates: Partial<NewsItem>): Promise<NewsItem | null> {
    if (supabase) {
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.badge !== undefined) payload.badge = updates.badge;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.additionalInfo !== undefined) payload.additional_info = updates.additionalInfo;
      if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
      if (updates.itemsList !== undefined) payload.items_list = updates.itemsList;

      const { data, error } = await supabase
        .from("noticias_web")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[NoticiasRepository] Error updating noticia ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.noticias.findIndex((n) => n.id === id);
    if (index === -1) return null;
    state.noticias[index] = { ...state.noticias[index], ...updates };
    db.save();
    return state.noticias[index];
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("noticias_web").delete().eq("id", id);
      if (error) {
        console.error(`[NoticiasRepository] Error deleting noticia ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    const index = state.noticias.findIndex((n) => n.id === id);
    if (index === -1) return false;
    state.noticias.splice(index, 1);
    db.save();
    return true;
  }

  private mapFromDb(n: any): NewsItem {
    return {
      id: n.id,
      title: n.title,
      date: n.date,
      category: n.category,
      badge: n.badge,
      description: n.description,
      additionalInfo: n.additional_info || "",
      imageUrl: n.image_url,
      itemsList: Array.isArray(n.items_list) ? n.items_list : [],
    };
  }
}

export const noticiasRepository = new NoticiasRepository();
