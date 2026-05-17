import { Subscriber } from "@/domain/Subscriber";
import { supabase } from "../supabase/client";

export class SubscriberRepository {
    async findAll(): Promise<Subscriber[]> {
        const { data, error } = await supabase
            .from("newsletter_subscribers")
            .select("*")
            .eq("is_active", true)
            .order("subscribed_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(
            (item) =>
                new Subscriber({
                    id: item.id,
                    email: item.email,
                    subscribedAt: new Date(item.subscribed_at),
                    isActive: item.is_active
                })
        );
    }

    async findByEmail(email: string): Promise<Subscriber | null> {
        const { data, error } = await supabase
            .from("newsletter_subscribers")
            .select("*")
            .eq("email", email)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return null;
            }
            throw new Error(error.message);
        }

        return new Subscriber({
            id: data.id,
            email: data.email,
            subscribedAt: new Date(data.subscribed_at),
            isActive: data.is_active
        });
    }

    async create(subscriber: Subscriber): Promise<Subscriber> {
        const { data, error } = await supabase
            .from("newsletter_subscribers")
            .insert({
                id: subscriber.id,
                email: subscriber.email,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Subscriber({
            id: data.id,
            email: data.email,
            subscribedAt: new Date(data.subscribed_at),
            isActive: data.is_active
        });
    }

    async reactivate(email: string): Promise<void> {
        const { error } = await supabase
            .from("newsletter_subscribers")
            .update({ is_active: true })
            .eq("email", email);

        if (error) {
            throw new Error(error.message);
        }
    }

    async deactivate(email: string): Promise<void> {
        const { error } = await supabase
            .from("newsletter_subscribers")
            .update({ is_active: false })
            .eq("email", email);

        if (error) {
            throw new Error(error.message);
        }
    }
}
