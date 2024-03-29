export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
      }
      collections: {
        Row: {
          created_at: string | null
          id: number
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          user_id?: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          user_id?: string
        }
      }
      deletes: {
        Row: {
          created_at: string | null
          id: number
          product_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_id: number
          user_id?: string
        }
        Update: {
          created_at?: string | null
          id?: number
          product_id?: number
          user_id?: string
        }
      }
      partners: {
        Row: {
          created_at: string | null
          homepage: string
          id: number
          live: boolean
          name: string
        }
        Insert: {
          created_at?: string | null
          homepage: string
          id?: number
          live: boolean
          name: string
        }
        Update: {
          created_at?: string | null
          homepage?: string
          id?: number
          live?: boolean
          name?: string
        }
      }
      products: {
        Row: {
          brand_id: number
          colors: string[]
          created_at: string
          description: string
          gender: string
          id: number
          images: string[]
          in_stock: boolean
          link: string
          name: string
          partner_id: number
          price: number
          product_type: string
          sale_price: number
          updated_at: string
          vendor_product_id: string
        }
        Insert: {
          brand_id: number
          colors: string[]
          created_at?: string
          description?: string
          gender: string
          id?: number
          images: string[]
          in_stock: boolean
          link: string
          name: string
          partner_id: number
          price: number
          product_type?: string
          sale_price: number
          updated_at?: string
          vendor_product_id: string
        }
        Update: {
          brand_id?: number
          colors?: string[]
          created_at?: string
          description?: string
          gender?: string
          id?: number
          images?: string[]
          in_stock?: boolean
          link?: string
          name?: string
          partner_id?: number
          price?: number
          product_type?: string
          sale_price?: number
          updated_at?: string
          vendor_product_id?: string
        }
      }
      saves: {
        Row: {
          collection_id: number | null
          created_at: string | null
          id: number
          product_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          collection_id?: number | null
          created_at?: string | null
          id?: number
          product_id: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          collection_id?: number | null
          created_at?: string | null
          id?: number
          product_id?: number
          updated_at?: string
          user_id?: string
        }
      }
      users: {
        Row: {
          country: string
          created_at: string | null
          currency: string
          dob: string
          email: string
          gender: string
          id: string
          name: string
        }
        Insert: {
          country?: string
          created_at?: string | null
          currency?: string
          dob: string
          email: string
          gender: string
          id: string
          name: string
        }
        Update: {
          country?: string
          created_at?: string | null
          currency?: string
          dob?: string
          email?: string
          gender?: string
          id?: string
          name?: string
        }
      }
    }
    Views: {
      v_deletes: {
        Row: {
          brand: string | null
          colors: string[] | null
          created_at: string | null
          deleted: boolean | null
          description: string | null
          gender: string | null
          id: number | null
          images: string[] | null
          in_stock: boolean | null
          link: string | null
          name: string | null
          partner: string | null
          price: number | null
          product_id: number | null
          product_type: string | null
          sale_price: number | null
          saved: boolean | null
          user_id: string | null
          vendor_product_id: string | null
        }
      }
      v_products: {
        Row: {
          brand: string | null
          brand_id: number | null
          colors: string[] | null
          created_at: string | null
          deleted: boolean | null
          description: string | null
          gender: string | null
          id: number | null
          images: string[] | null
          in_stock: boolean | null
          link: string | null
          name: string | null
          partner: string | null
          partner_id: number | null
          price: number | null
          product_type: string | null
          sale_price: number | null
          saved: boolean | null
          updated_at: string | null
          vendor_product_id: string | null
        }
      }
      v_saves: {
        Row: {
          brand: string | null
          collection_id: number | null
          collection_name: string | null
          colors: string[] | null
          created_at: string | null
          deleted: boolean | null
          description: string | null
          gender: string | null
          id: number | null
          images: string[] | null
          in_stock: boolean | null
          link: string | null
          name: string | null
          partner: string | null
          price: number | null
          product_id: number | null
          product_type: string | null
          sale_price: number | null
          saved: boolean | null
          user_id: string | null
          vendor_product_id: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

