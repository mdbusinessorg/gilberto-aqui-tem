export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string | null
          check_in_photo?: string | null
          check_out: string | null
          check_out_photo?: string | null
          created_at: string
          device_info: string | null
          early_leave_minutes: number
          employee_id: string
          id: string
          late_minutes: number
          notes: string | null
          overtime_minutes: number
          recorded_by: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          work_date: string
          worked_minutes: number
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          device_info?: string | null
          early_leave_minutes?: number
          employee_id: string
          id?: string
          late_minutes?: number
          notes?: string | null
          overtime_minutes?: number
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          work_date?: string
          worked_minutes?: number
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          device_info?: string | null
          early_leave_minutes?: number
          employee_id?: string
          id?: string
          late_minutes?: number
          notes?: string | null
          overtime_minutes?: number
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          work_date?: string
          worked_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          cta_label: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          sort_order: number
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachment_url: string | null
          audio_seconds: number | null
          audio_url: string | null
          body: string | null
          created_at: string
          id: string
          is_staff: boolean
          room_id: string
          sender_id: string | null
          sender_name: string
        }
        Insert: {
          attachment_url?: string | null
          audio_seconds?: number | null
          audio_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_staff?: boolean
          room_id: string
          sender_id?: string | null
          sender_name?: string
        }
        Update: {
          attachment_url?: string | null
          audio_seconds?: number | null
          audio_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_staff?: boolean
          room_id?: string
          sender_id?: string | null
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          customer_profile_id: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          name: string | null
          product_id: string | null
          type: Database["public"]["Enums"]["chat_room_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_profile_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          name?: string | null
          product_id?: string | null
          type: Database["public"]["Enums"]["chat_room_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_profile_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          name?: string | null
          product_id?: string | null
          type?: Database["public"]["Enums"]["chat_room_type"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order: number
          source: string
          starts_at: string
          uses: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order?: number
          source?: string
          starts_at?: string
          uses?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order?: number
          source?: string
          starts_at?: string
          uses?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          address: string
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          label: string | null
          municipality: string | null
          province: string | null
          reference_point: string | null
        }
        Insert: {
          address: string
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          label?: string | null
          municipality?: string | null
          province?: string | null
          reference_point?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          label?: string | null
          municipality?: string | null
          province?: string | null
          reference_point?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string | null
          id: string
          last_order_at: string | null
          location: string | null
          loyalty_points: number
          name: string
          notes: string | null
          orders_count: number
          phone: string | null
          profile_id: string | null
          status: string
          tier: Database["public"]["Enums"]["loyalty_tier"]
          total_spent: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_order_at?: string | null
          location?: string | null
          loyalty_points?: number
          name: string
          notes?: string | null
          orders_count?: number
          phone?: string | null
          profile_id?: string | null
          status?: string
          tier?: Database["public"]["Enums"]["loyalty_tier"]
          total_spent?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_order_at?: string | null
          location?: string | null
          loyalty_points?: number
          name?: string
          notes?: string | null
          orders_count?: number
          phone?: string | null
          profile_id?: string | null
          status?: string
          tier?: Database["public"]["Enums"]["loyalty_tier"]
          total_spent?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_goals: {
        Row: {
          actual_result: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          department: string | null
          description: string | null
          employee_id: string | null
          id: string
          kind: string
          manager_notes: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          progress: number
          start_date: string | null
          status: Database["public"]["Enums"]["work_status"]
          target: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_result?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          department?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          kind?: string
          manager_notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          progress?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["work_status"]
          target?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_result?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          department?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          kind?: string
          manager_notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          progress?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["work_status"]
          target?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_goals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_kpis: {
        Row: {
          actual: number
          auto_metric: string | null
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          name: string
          notes: string | null
          period_end: string
          period_start: string
          target: number
          unit: string
          updated_at: string
        }
        Insert: {
          actual?: number
          auto_metric?: string | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          name: string
          notes?: string | null
          period_end: string
          period_start: string
          target?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          actual?: number
          auto_metric?: string | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          name?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          target?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_kpis_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_kpis_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          department: string
          email: string | null
          employee_code: string | null
          full_name: string
          hire_date: string | null
          id: string
          late_tolerance_minutes: number
          notes: string | null
          phone: string | null
          position: string | null
          profile_id: string | null
          schedule_end: string
          schedule_start: string
          status: string
          updated_at: string
          work_days: number[]
        }
        Insert: {
          created_at?: string
          department?: string
          email?: string | null
          employee_code?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          late_tolerance_minutes?: number
          notes?: string | null
          phone?: string | null
          position?: string | null
          profile_id?: string | null
          schedule_end?: string
          schedule_start?: string
          status?: string
          updated_at?: string
          work_days?: number[]
        }
        Update: {
          created_at?: string
          department?: string
          email?: string | null
          employee_code?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          late_tolerance_minutes?: number
          notes?: string | null
          phone?: string | null
          position?: string | null
          profile_id?: string | null
          schedule_end?: string
          schedule_start?: string
          status?: string
          updated_at?: string
          work_days?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          location_id: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          location_id: string
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          location_id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          id: string
          is_active: boolean
          kind: string
          name: string
          sells: boolean
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          kind?: string
          name: string
          sells?: boolean
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          kind?: string
          name?: string
          sells?: boolean
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          location_id: string | null
          notes: string | null
          product_id: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          to_location_id: string | null
          type: Database["public"]["Enums"]["movement_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location_id?: string | null
          notes?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          to_location_id?: string | null
          type: Database["public"]["Enums"]["movement_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string | null
          notes?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          to_location_id?: string | null
          type?: Database["public"]["Enums"]["movement_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          customer_id: string
          description: string | null
          id: string
          kind: string
          points: number
          reference: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          kind: string
          points: number
          reference?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          kind?: string
          points?: number
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_reads: {
        Row: {
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          priority: Database["public"]["Enums"]["notification_priority"]
          target_roles: Database["public"]["Enums"]["user_role"][] | null
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          discount: number
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          sku: string | null
          total: number
          unit_cost: number | null
          unit_price: number
        }
        Insert: {
          discount?: number
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          sku?: string | null
          total: number
          unit_cost?: number | null
          unit_price: number
        }
        Update: {
          discount?: number
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sku?: string | null
          total?: number
          unit_cost?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          channel: Database["public"]["Enums"]["order_channel"]
          coupon_code: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_fee: number
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          discount: number
          id: string
          internal_notes: string | null
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          points_awarded: boolean
          seller_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          stock_deducted: boolean
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["order_channel"]
          coupon_code?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          discount?: number
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          points_awarded?: boolean
          seller_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stock_deducted?: boolean
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["order_channel"]
          coupon_code?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          discount?: number
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          points_awarded?: boolean
          seller_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stock_deducted?: boolean
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          improvements: string | null
          notes: string | null
          period: string
          reviewer_id: string | null
          score: number | null
          strengths: string | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          improvements?: string | null
          notes?: string | null
          period: string
          reviewer_id?: string | null
          score?: number | null
          strengths?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          improvements?: string | null
          notes?: string | null
          period?: string
          reviewer_id?: string | null
          score?: number | null
          strengths?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          battery_health: number | null
          brand_id: string | null
          category_id: string | null
          color: string | null
          condition: Database["public"]["Enums"]["product_condition"]
          cost_price: number | null
          created_at: string
          created_by: string | null
          description: string | null
          device_details: Json
          id: string
          internal_notes: string | null
          is_active: boolean
          is_featured: boolean
          is_promo: boolean
          min_stock: number
          model: string | null
          name: string
          price: number
          promo_price: number | null
          ram: string | null
          rating_avg: number
          rating_count: number
          sku: string
          slug: string
          sold_count: number
          specs: Json
          stock_total: number
          storage: string | null
          updated_at: string
          video_url: string | null
          warranty_months: number | null
        }
        Insert: {
          battery_health?: number | null
          brand_id?: string | null
          category_id?: string | null
          color?: string | null
          condition?: Database["public"]["Enums"]["product_condition"]
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          device_details?: Json
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_promo?: boolean
          min_stock?: number
          model?: string | null
          name: string
          price: number
          promo_price?: number | null
          ram?: string | null
          rating_avg?: number
          rating_count?: number
          sku: string
          slug: string
          sold_count?: number
          specs?: Json
          stock_total?: number
          storage?: string | null
          updated_at?: string
          video_url?: string | null
          warranty_months?: number | null
        }
        Update: {
          battery_health?: number | null
          brand_id?: string | null
          category_id?: string | null
          color?: string | null
          condition?: Database["public"]["Enums"]["product_condition"]
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          device_details?: Json
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_promo?: boolean
          min_stock?: number
          model?: string | null
          name?: string
          price?: number
          promo_price?: number | null
          ram?: string | null
          rating_avg?: number
          rating_count?: number
          sku?: string
          slug?: string
          sold_count?: number
          specs?: Json
          stock_total?: number
          storage?: string | null
          updated_at?: string
          video_url?: string | null
          warranty_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      promotion_products: {
        Row: {
          product_id: string
          promotion_id: string
        }
        Insert: {
          product_id: string
          promotion_id: string
        }
        Update: {
          product_id?: string
          promotion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          name: string
          starts_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          starts_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number
          unit_cost: number
        }
        Insert: {
          id?: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number
          unit_cost?: number
        }
        Update: {
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          location_id: string | null
          notes: string | null
          po_number: string
          received_at: string | null
          status: Database["public"]["Enums"]["po_status"]
          supplier_id: string | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          po_number?: string
          received_at?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          supplier_id?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          po_number?: string
          received_at?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          supplier_id?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          condition: string | null
          created_at: string
          customer_id: string | null
          decision_notes: string | null
          id: string
          order_id: string
          order_item_id: string | null
          processed_by: string | null
          product_id: string | null
          quantity: number
          reason: string
          refund_amount: number | null
          resolution: string | null
          restock_location_id: string | null
          restocked: boolean
          status: Database["public"]["Enums"]["return_status"]
          updated_at: string
        }
        Insert: {
          condition?: string | null
          created_at?: string
          customer_id?: string | null
          decision_notes?: string | null
          id?: string
          order_id: string
          order_item_id?: string | null
          processed_by?: string | null
          product_id?: string | null
          quantity?: number
          reason: string
          refund_amount?: number | null
          resolution?: string | null
          restock_location_id?: string | null
          restocked?: boolean
          status?: Database["public"]["Enums"]["return_status"]
          updated_at?: string
        }
        Update: {
          condition?: string | null
          created_at?: string
          customer_id?: string | null
          decision_notes?: string | null
          id?: string
          order_id?: string
          order_item_id?: string | null
          processed_by?: string | null
          product_id?: string | null
          quantity?: number
          reason?: string
          refund_amount?: number | null
          resolution?: string | null
          restock_location_id?: string | null
          restocked?: boolean
          status?: Database["public"]["Enums"]["return_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_restock_location_id_fkey"
            columns: ["restock_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          admin_response: string | null
          author_name: string
          body: string
          created_at: string
          customer_id: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_verified: boolean
          moderated_by: string | null
          order_id: string | null
          product_id: string
          profile_id: string | null
          rating: number
          responded_at: string | null
          status: Database["public"]["Enums"]["review_status"]
          title: string | null
        }
        Insert: {
          admin_response?: string | null
          author_name: string
          body: string
          created_at?: string
          customer_id?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_verified?: boolean
          moderated_by?: string | null
          order_id?: string | null
          product_id: string
          profile_id?: string | null
          rating: number
          responded_at?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
        }
        Update: {
          admin_response?: string | null
          author_name?: string
          body?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_verified?: boolean
          moderated_by?: string | null
          order_id?: string | null
          product_id?: string
          profile_id?: string | null
          rating?: number
          responded_at?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          is_public: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          is_public?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          is_public?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
          notes: string | null
          phone: string | null
          products_supplied: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          products_supplied?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          products_supplied?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          employee_id: string | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          progress: number
          status: Database["public"]["Enums"]["work_status"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          progress?: number
          status?: Database["public"]["Enums"]["work_status"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          progress?: number
          status?: Database["public"]["Enums"]["work_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_exchanges: {
        Row: {
          created_at: string
          created_by: string | null
          device_value: number
          difference: number
          id: string
          new_product_id: string | null
          new_product_price: number
          notes: string | null
          order_id: string | null
          trade_request_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          device_value: number
          difference?: number
          id?: string
          new_product_id?: string | null
          new_product_price?: number
          notes?: string | null
          order_id?: string | null
          trade_request_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          device_value?: number
          difference?: number
          id?: string
          new_product_id?: string | null
          new_product_price?: number
          notes?: string | null
          order_id?: string | null
          trade_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_exchanges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_exchanges_new_product_id_fkey"
            columns: ["new_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_exchanges_new_product_id_fkey"
            columns: ["new_product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_exchanges_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_exchanges_trade_request_id_fkey"
            columns: ["trade_request_id"]
            isOneToOne: false
            referencedRelation: "trade_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_requests: {
        Row: {
          accessories: string | null
          battery_health: number | null
          brand: string
          condition: string | null
          created_at: string
          customer_id: string | null
          desired_product_id: string | null
          estimated_value: number | null
          evaluated_by: string | null
          expected_value: number | null
          final_offer: number | null
          id: string
          inspection_condition: string | null
          inspection_result: string | null
          model: string
          name: string
          notes: string | null
          phone: string
          photos: string[]
          profile_id: string | null
          status: Database["public"]["Enums"]["trade_status"]
          storage: string | null
          updated_at: string
        }
        Insert: {
          accessories?: string | null
          battery_health?: number | null
          brand: string
          condition?: string | null
          created_at?: string
          customer_id?: string | null
          desired_product_id?: string | null
          estimated_value?: number | null
          evaluated_by?: string | null
          expected_value?: number | null
          final_offer?: number | null
          id?: string
          inspection_condition?: string | null
          inspection_result?: string | null
          model: string
          name: string
          notes?: string | null
          phone: string
          photos?: string[]
          profile_id?: string | null
          status?: Database["public"]["Enums"]["trade_status"]
          storage?: string | null
          updated_at?: string
        }
        Update: {
          accessories?: string | null
          battery_health?: number | null
          brand?: string
          condition?: string | null
          created_at?: string
          customer_id?: string | null
          desired_product_id?: string | null
          estimated_value?: number | null
          evaluated_by?: string | null
          expected_value?: number | null
          final_offer?: number | null
          id?: string
          inspection_condition?: string | null
          inspection_result?: string | null
          model?: string
          name?: string
          notes?: string | null
          phone?: string
          photos?: string[]
          profile_id?: string | null
          status?: Database["public"]["Enums"]["trade_status"]
          storage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_requests_desired_product_id_fkey"
            columns: ["desired_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_requests_desired_product_id_fkey"
            columns: ["desired_product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_requests_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wheel_prizes: {
        Row: {
          color: string
          coupon_days: number
          id: string
          is_active: boolean
          kind: string
          label: string
          sort_order: number
          value: number
          weight: number
        }
        Insert: {
          color?: string
          coupon_days?: number
          id?: string
          is_active?: boolean
          kind: string
          label: string
          sort_order?: number
          value?: number
          weight?: number
        }
        Update: {
          color?: string
          coupon_days?: number
          id?: string
          is_active?: boolean
          kind?: string
          label?: string
          sort_order?: number
          value?: number
          weight?: number
        }
        Relationships: []
      }
      wheel_spins: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          prize_id: string | null
          prize_label: string
          profile_id: string | null
          result: Json
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          prize_id?: string | null
          prize_label: string
          profile_id?: string | null
          result?: Json
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          prize_id?: string | null
          prize_label?: string
          profile_id?: string | null
          result?: Json
        }
        Relationships: [
          {
            foreignKeyName: "wheel_spins_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wheel_spins_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "wheel_prizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wheel_spins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          product_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      storefront_products: {
        Row: {
          battery_health: number | null
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          color: string | null
          condition: Database["public"]["Enums"]["product_condition"] | null
          created_at: string | null
          description: string | null
          device_details: Json | null
          id: string | null
          image_url: string | null
          is_featured: boolean | null
          is_promo: boolean | null
          model: string | null
          name: string | null
          price: number | null
          promo_price: number | null
          ram: string | null
          rating_avg: number | null
          rating_count: number | null
          sku: string | null
          slug: string | null
          sold_count: number | null
          specs: Json | null
          stock_total: number | null
          storage: string | null
          video_url: string | null
          warranty_months: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      apply_inventory_movement: {
        Args: {
          p_location_id?: string
          p_notes?: string
          p_product_id: string
          p_quantity: number
          p_reason?: string
          p_reference_id?: string
          p_reference_type?: string
          p_to_location_id?: string
          p_type: Database["public"]["Enums"]["movement_type"]
          p_user_id?: string
        }
        Returns: string
      }
      clock_in: {
        Args: { p_device?: string; p_photo?: string }
        Returns: {
          check_in: string | null
          check_out: string | null
          created_at: string
          device_info: string | null
          early_leave_minutes: number
          employee_id: string
          id: string
          late_minutes: number
          notes: string | null
          overtime_minutes: number
          recorded_by: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          work_date: string
          worked_minutes: number
        }
        SetofOptions: {
          from: "*"
          to: "attendance"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      clock_out: {
        Args: { p_photo?: string }
        Returns: {
          check_in: string | null
          check_out: string | null
          created_at: string
          device_info: string | null
          early_leave_minutes: number
          employee_id: string
          id: string
          late_minutes: number
          notes: string | null
          overtime_minutes: number
          recorded_by: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          work_date: string
          worked_minutes: number
        }
        SetofOptions: {
          from: "*"
          to: "attendance"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      dashboard_stats: { Args: never; Returns: Json }
      assistant_context: { Args: never; Returns: Json }
      effective_price: {
        Args: { p: Database["public"]["Tables"]["products"]["Row"] }
        Returns: number
      }
      ensure_my_customer: { Args: never; Returns: string }
      financial_summary: {
        Args: { p_from: string; p_to: string }
        Returns: Json
      }
      find_profile_by_email: { Args: { p_email: string }; Returns: Json }
      get_or_create_room: {
        Args: {
          p_product_id?: string
          p_type: Database["public"]["Enums"]["chat_room_type"]
        }
        Returns: string
      }
      global_search: { Args: { q: string }; Returns: Json }
      has_role: { Args: { roles: string[] }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      lookup_order: {
        Args: { p_number: string; p_phone: string }
        Returns: Json
      }
      my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      next_order_number: { Args: never; Returns: string }
      notify_staff: {
        Args: {
          p_body: string
          p_kind: string
          p_link: string
          p_priority: Database["public"]["Enums"]["notification_priority"]
          p_roles?: Database["public"]["Enums"]["user_role"][]
          p_title: string
        }
        Returns: undefined
      }
      place_order: { Args: { payload: Json }; Returns: Json }
      process_return: {
        Args: {
          p_location_id: string
          p_notes: string
          p_refund: number
          p_resolution: string
          p_restock: boolean
          p_return_id: string
          p_status: Database["public"]["Enums"]["return_status"]
        }
        Returns: undefined
      }
      receive_purchase_order: {
        Args: { p_items?: Json; p_po_id: string }
        Returns: undefined
      }
      redeem_points: { Args: { p_points: number }; Returns: Json }
      revenue_series: {
        Args: { p_days?: number }
        Returns: {
          day: string
          orders: number
          revenue: number
        }[]
      }
      sales_by_category: {
        Args: { p_from: string; p_to: string }
        Returns: {
          category: string
          revenue: number
          units: number
        }[]
      }
      sales_by_employee: {
        Args: { p_from: string; p_to: string }
        Returns: {
          orders: number
          revenue: number
          seller: string
          seller_id: string
        }[]
      }
      set_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      slugify: { Args: { txt: string }; Returns: string }
      spin_wheel: { Args: never; Returns: Json }
      staff_apply_movement: {
        Args: {
          p_location_id?: string
          p_notes?: string
          p_product_id: string
          p_quantity: number
          p_reason?: string
          p_to_location_id?: string
          p_type: Database["public"]["Enums"]["movement_type"]
        }
        Returns: string
      }
      top_products: {
        Args: { p_from: string; p_limit?: number; p_to: string }
        Returns: {
          name: string
          product_id: string
          revenue: number
          units: number
        }[]
      }
      upsert_customer: {
        Args: {
          p_email: string
          p_location?: string
          p_name: string
          p_phone: string
          p_profile_id: string
        }
        Returns: string
      }
      validate_coupon: {
        Args: { p_code: string; p_customer_id?: string; p_subtotal: number }
        Returns: {
          coupon_id: string
          discount: number
          message: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      attendance_status: "presente" | "atrasado" | "ausente" | "justificado"
      chat_room_type: "produto" | "suporte" | "equipa"
      delivery_method: "levantamento" | "entrega"
      discount_type: "percentual" | "fixo"
      loyalty_tier: "regular" | "silver" | "gold" | "vip"
      movement_type:
        | "entrada"
        | "saida"
        | "venda"
        | "devolucao"
        | "troca"
        | "danificado"
        | "perdido"
        | "ajuste"
        | "transferencia"
      notification_priority: "baixa" | "normal" | "alta" | "critica"
      order_channel: "website" | "whatsapp" | "loja" | "manual"
      order_status:
        | "pendente"
        | "confirmado"
        | "pago"
        | "em_preparacao"
        | "enviado"
        | "entregue"
        | "concluido"
        | "cancelado"
        | "devolvido"
      payment_status: "pendente" | "pago" | "parcial" | "reembolsado"
      po_status:
        | "rascunho"
        | "encomendado"
        | "parcialmente_recebido"
        | "recebido"
        | "cancelado"
      priority_level: "baixa" | "media" | "alta" | "urgente"
      product_condition: "novo" | "recondicionado" | "usado"
      return_status: "pendente" | "aprovada" | "rejeitada" | "concluida"
      review_status: "pendente" | "aprovada" | "rejeitada" | "oculta"
      trade_status:
        | "novo"
        | "em_avaliacao"
        | "proposta_enviada"
        | "aceite"
        | "rejeitado"
        | "aparelho_recebido"
        | "concluido"
      user_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "sales"
        | "warehouse"
        | "customer_service"
        | "marketing"
        | "delivery"
        | "technician"
        | "customer"
      work_status:
        | "nao_iniciada"
        | "em_progresso"
        | "concluida"
        | "atrasada"
        | "cancelada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attendance_status: ["presente", "atrasado", "ausente", "justificado"],
      chat_room_type: ["produto", "suporte", "equipa"],
      delivery_method: ["levantamento", "entrega"],
      discount_type: ["percentual", "fixo"],
      loyalty_tier: ["regular", "silver", "gold", "vip"],
      movement_type: [
        "entrada",
        "saida",
        "venda",
        "devolucao",
        "troca",
        "danificado",
        "perdido",
        "ajuste",
        "transferencia",
      ],
      notification_priority: ["baixa", "normal", "alta", "critica"],
      order_channel: ["website", "whatsapp", "loja", "manual"],
      order_status: [
        "pendente",
        "confirmado",
        "pago",
        "em_preparacao",
        "enviado",
        "entregue",
        "concluido",
        "cancelado",
        "devolvido",
      ],
      payment_status: ["pendente", "pago", "parcial", "reembolsado"],
      po_status: [
        "rascunho",
        "encomendado",
        "parcialmente_recebido",
        "recebido",
        "cancelado",
      ],
      priority_level: ["baixa", "media", "alta", "urgente"],
      product_condition: ["novo", "recondicionado", "usado"],
      return_status: ["pendente", "aprovada", "rejeitada", "concluida"],
      review_status: ["pendente", "aprovada", "rejeitada", "oculta"],
      trade_status: [
        "novo",
        "em_avaliacao",
        "proposta_enviada",
        "aceite",
        "rejeitado",
        "aparelho_recebido",
        "concluido",
      ],
      user_role: [
        "super_admin",
        "admin",
        "manager",
        "sales",
        "warehouse",
        "customer_service",
        "marketing",
        "delivery",
        "technician",
        "customer",
      ],
      work_status: [
        "nao_iniciada",
        "em_progresso",
        "concluida",
        "atrasada",
        "cancelada",
      ],
    },
  },
} as const
