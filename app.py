import streamlit as st
import pandas as pd
from datetime import datetime

st.set_page_config(
    page_title="Retail Inventory Management",
    page_icon="📦",
    layout="wide"
)

# -----------------------------
# Sample Product Dataset
# -----------------------------
if "products" not in st.session_state:
    st.session_state.products = [
        {
            "ID": 1,
            "Product": "Lays Classic",
            "Category": "Chips",
            "Price": 20,
            "Stock": 50,
            "Reorder Level": 10
        },
        {
            "ID": 2,
            "Product": "Uncle Chips",
            "Category": "Chips",
            "Price": 20,
            "Stock": 35,
            "Reorder Level": 10
        },
        {
            "ID": 3,
            "Product": "Kurkure Masala Munch",
            "Category": "Snacks",
            "Price": 20,
            "Stock": 45,
            "Reorder Level": 10
        },
        {
            "ID": 4,
            "Product": "Bingo Mad Angles",
            "Category": "Snacks",
            "Price": 20,
            "Stock": 25,
            "Reorder Level": 8
        },
        {
            "ID": 5,
            "Product": "Haldiram's Aloo Bhujia",
            "Category": "Namkeen",
            "Price": 50,
            "Stock": 30,
            "Reorder Level": 8
        },
    ]

if "sales" not in st.session_state:
    st.session_state.sales = []


# -----------------------------
# Sidebar
# -----------------------------
st.sidebar.title("📦 Retail Inventory")

page = st.sidebar.radio(
    "Navigation",
    [
        "Overview",
        "Products",
        "Inventory",
        "Sales",
        "Dataset"
    ]
)


# -----------------------------
# DataFrame
# -----------------------------
products_df = pd.DataFrame(st.session_state.products)


# -----------------------------
# Overview
# -----------------------------
if page == "Overview":

    st.title("📊 Retail Inventory Management")
    st.write("Manage products, inventory and sales from one dashboard.")

    total_products = len(products_df)
    total_stock = int(products_df["Stock"].sum())
    low_stock = int(
        (products_df["Stock"] <= products_df["Reorder Level"]).sum()
    )

    inventory_value = int(
        (products_df["Price"] * products_df["Stock"]).sum()
    )

    col1, col2, col3, col4 = st.columns(4)

    col1.metric("Total Products", total_products)
    col2.metric("Total Stock", total_stock)
    col3.metric("Low Stock Items", low_stock)
    col4.metric("Inventory Value", f"₹{inventory_value:,}")

    st.subheader("📋 Current Inventory")

    display_df = products_df.copy()

    display_df["Status"] = display_df.apply(
        lambda row:
        "🔴 Low Stock"
        if row["Stock"] <= row["Reorder Level"]
        else "🟢 In Stock",
        axis=1
    )

    st.dataframe(
        display_df,
        use_container_width=True,
        hide_index=True
    )


# -----------------------------
# Products
# -----------------------------
elif page == "Products":

    st.title("📦 Products")

    st.subheader("Add New Product")

    with st.form("add_product"):

        product_name = st.text_input("Product Name")
        category = st.text_input("Category")
        price = st.number_input(
            "Price (₹)",
            min_value=0.0,
            step=1.0
        )
        stock = st.number_input(
            "Stock",
            min_value=0,
            step=1
        )
        reorder = st.number_input(
            "Reorder Level",
            min_value=0,
            step=1
        )

        submitted = st.form_submit_button("➕ Add Product")

        if submitted:

            if product_name.strip() == "":
                st.error("Please enter a product name.")

            else:

                new_id = (
                    max([p["ID"] for p in st.session_state.products])
                    + 1
                    if st.session_state.products
                    else 1
                )

                st.session_state.products.append(
                    {
                        "ID": new_id,
                        "Product": product_name,
                        "Category": category,
                        "Price": price,
                        "Stock": stock,
                        "Reorder Level": reorder
                    }
                )

                st.success("Product added successfully!")
                st.rerun()

    st.subheader("Product List")

    st.dataframe(
        pd.DataFrame(st.session_state.products),
        use_container_width=True,
        hide_index=True
    )


# -----------------------------
# Inventory
# -----------------------------
elif page == "Inventory":

    st.title("📦 Inventory")

    df = pd.DataFrame(st.session_state.products)

    search = st.text_input(
        "🔎 Search Product"
    )

    if search:
        df = df[
            df["Product"]
            .str.contains(search, case=False, na=False)
        ]

    category_filter = st.selectbox(
        "Category",
        ["All"] + sorted(
            pd.DataFrame(st.session_state.products)["Category"]
            .unique()
            .tolist()
        )
    )

    if category_filter != "All":
        df = df[df["Category"] == category_filter]

    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True
    )

    st.subheader("⚠️ Low Stock")

    low_stock_df = df[
        df["Stock"] <= df["Reorder Level"]
    ]

    if low_stock_df.empty:
        st.success("No low-stock products.")

    else:
        st.dataframe(
            low_stock_df,
            use_container_width=True,
            hide_index=True
        )


# -----------------------------
# Sales
# -----------------------------
elif page == "Sales":

    st.title("💰 Sales")

    df = pd.DataFrame(st.session_state.products)

    product_names = df["Product"].tolist()

    if product_names:

        selected_product = st.selectbox(
            "Select Product",
            product_names
        )

        quantity = st.number_input(
            "Quantity",
            min_value=1,
            step=1
        )

        if st.button("💰 Record Sale"):

            product_index = next(
                i
                for i, p in enumerate(st.session_state.products)
                if p["Product"] == selected_product
            )

            product = st.session_state.products[product_index]

            if quantity > product["Stock"]:

                st.error("Not enough stock available.")

            else:

                product["Stock"] -= quantity

                sale_amount = quantity * product["Price"]

                st.session_state.sales.append(
                    {
                        "Date": datetime.now().strftime(
                            "%Y-%m-%d %H:%M"
                        ),
                        "Product": selected_product,
                        "Quantity": quantity,
                        "Amount": sale_amount
                    }
                )

                st.success(
                    f"Sale recorded! Total: ₹{sale_amount:,.2f}"
                )

                st.rerun()

    st.subheader("Sales History")

    if st.session_state.sales:

        sales_df = pd.DataFrame(
            st.session_state.sales
        )

        st.dataframe(
            sales_df,
            use_container_width=True,
            hide_index=True
        )

    else:

        st.info("No sales recorded yet.")


# -----------------------------
# Dataset
# -----------------------------
elif page == "Dataset":

    st.title("📂 Dataset")

    st.write(
        "Import a CSV file to add products to the inventory."
    )

    uploaded_file = st.file_uploader(
        "Upload CSV",
        type=["csv"]
    )

    if uploaded_file is not None:

        try:

            uploaded_df = pd.read_csv(
                uploaded_file
            )

            st.subheader("Preview")

            st.dataframe(
                uploaded_df,
                use_container_width=True,
                hide_index=True
            )

            if st.button("Import Dataset"):

                required_columns = [
                    "Product",
                    "Category",
                    "Price",
                    "Stock",
                    "Reorder Level"
                ]

                if all(
                    column in uploaded_df.columns
                    for column in required_columns
                ):

                    for _, row in uploaded_df.iterrows():

                        new_id = (
                            max(
                                [
                                    p["ID"]
                                    for p in st.session_state.products
                                ]
                            ) + 1
                            if st.session_state.products
                            else 1
                        )

                        st.session_state.products.append(
                            {
                                "ID": new_id,
                                "Product": row["Product"],
                                "Category": row["Category"],
                                "Price": float(row["Price"]),
                                "Stock": int(row["Stock"]),
                                "Reorder Level": int(
                                    row["Reorder Level"]
                                )
                            }
                        )

                    st.success(
                        "Dataset imported successfully!"
                    )

                    st.rerun()

                else:

                    st.error(
                        "CSV must contain: Product, Category, "
                        "Price, Stock, Reorder Level"
                    )

        except Exception as e:
            st.error(f"Error reading CSV: {e}")

    st.subheader("Current Dataset")

    st.dataframe(
        pd.DataFrame(st.session_state.products),
        use_container_width=True,
        hide_index=True
    )