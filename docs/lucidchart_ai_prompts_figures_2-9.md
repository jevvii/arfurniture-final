# Lucidchart AI Prompts for AR-Fit Capstone Diagrams (Figures 2-9)

Generated on: 2026-05-16
Aligned with: *An-Augmented-Reality-System-for-Accurate-Furniture-Sizing-and-Order-Precision.docx* descriptions.

---

## General Instructions for All Prompts

When generating each diagram in Lucidchart AI, adhere to these global standards:
- Use **professional academic styling**: clean lines, consistent fonts (Arial or Calibri), legible sizes.
- Include a **legend/key** explaining shapes and colors.
- **Label every connection/arrow** with the data being transferred.
- Use **consistent color coding**:
  - Blue: External entities / Users / Client-side
  - Green: System processes / Backend logic
  - Orange: Data storage / Database
  - Purple: External services / Cloud infrastructure
  - Gray: Communication channels
- Ensure **captions and numbering** are applied as "Figure X: Title".
- Follow **UML notation** for Use Case, Activity, and Deployment diagrams.
- Follow **Crow's Foot notation** for ERD.
- Follow **ISO 5807 / Gane-Sarson** for DFD symbols.

---

## Figure 2: System Architecture

**Doc Alignment:**
> "The user launches the website application to view furniture models or place an order. The website uses the device camera and sends a request to the AR processing module and cloud database. The AR module scans the user's room and overlays 3D furniture models to ensure accurate sizing, while the cloud database checks stock availability and product details. The processed data is then sent back to the app, allowing the user to visualize the furniture in real-time and proceed with precise ordering."

**Prompt for Lucidchart AI:**

```
Create a System Architecture Diagram for "AR-Fit: An Augmented Reality System for Accurate Furniture Sizing and Order Precision."

Style: Professional academic system architecture diagram. Simple, clean layout with 4-5 main component blocks arranged left-to-right in a logical flow.

Components and Layout:

[Left - Blue]
- Stick figure labeled "User"
- Below the user, a small smartphone icon labeled "Device with Camera"
- Solid arrow from User to Device: "Launches Website App"

[Center-Left - Green]
- Large rounded rectangle labeled "Website Application"
  - Sub-label: "Product Catalog | Cart | Checkout"
- Solid arrow from Device to Website App: "HTTP/HTTPS Request"

[Center - Green / Purple]
- Two stacked rectangles side-by-side inside a larger boundary:
  - Top rectangle (Green): "AR Processing Module"
    - Sub-label: "Scans room, overlays 3D furniture models, ensures accurate sizing"
  - Bottom rectangle (Orange): "Cloud Database"
    - Sub-label: "Checks stock availability & product details"
- Solid arrows from Website App to both AR Module and Cloud DB:
  - To AR Module: "Camera feed + selected furniture data"
  - To Cloud DB: "Product / stock query"

[Center-Right - Green]
- Rectangle labeled "Data Processing"
  - Sub-label: "Combines AR visualization + inventory response"
- Solid arrows from AR Module and Cloud DB into Data Processing:
  - From AR Module: "3D overlay + sizing feedback"
  - From Cloud DB: "Stock status + product details"

[Right - Blue]
- Rectangle labeled "Real-Time Visualization & Ordering"
  - Sub-label: "User sees furniture in actual space + places precise order"
- Solid arrow from Data Processing to Real-Time Visualization: "Processed response"
- Solid arrow from Real-Time Visualization back to User: "AR view + order confirmation"

Connections (keep arrows clean and labeled):
1. User -> Device: "Launch app"
2. Device -> Website App: "Browse / select product"
3. Website App -> AR Processing Module: "Send camera + model request"
4. Website App -> Cloud Database: "Check stock & details"
5. AR Processing Module -> Data Processing: "3D overlay + sizing"
6. Cloud Database -> Data Processing: "Stock + product info"
7. Data Processing -> Real-Time Visualization: "Combined data"
8. Real-Time Visualization -> User: "View in AR + place order"

Include a legend at the bottom right:
- Blue = User / Client-side
- Green = System Processing / Application
- Orange = Data Storage
- Solid arrow = Data / Request Flow
```

---

## Figure 3: Contextual Diagram

**Doc Alignment:**
> "Figure 3 shows the Contextual Diagram of the AR Furniture Sizing and Order-Precision System. This diagram gives a high-level overview of the system by showing its boundaries and how it interacts with external entities. Instead of focusing on internal processes, it emphasizes who uses the system and what kind of data flows in and out of it.

> The diagram identifies two main external entities: the Customer and the Admin/Management..."

**Prompt for Lucidchart AI:**

```
Create a Context Diagram (Level 0 DFD) for "AR-Fit: An Augmented Reality System for Accurate Furniture Sizing and Order Precision."

Style: ISO 5807 / Gane-Sarson DFD notation. Single central process. Clean academic style. Only TWO external entities as described in the documentation.

Symbols:
- External Entities: Rectangles
- System Process: Large rounded rectangle / Circle labeled "0"
- Data Flows: Arrows with labeled data names

Layout:

[Center]
- Large rounded rectangle labeled "0 - AR-Fit System"

[External Entities - one on each side]
- Left side: Rectangle "Customer"
- Right side: Rectangle "Admin / Management"

Data Flows:

From Customer to System:
- "Room Dimensions / Camera Input"
- "Furniture Preferences / Selection"
- "Order Request"

From System to Customer:
- "Real-Time AR Visualizations" (furniture digitally placed in user's space)
- "Accurate Size-Fit Feedback" (helps determine if furniture fits)
- "Order Confirmations" (status of purchase)

From Admin to System:
- "Inventory Details" (product stock)
- "Product Specifications" (name, dimensions, materials)
- "Pricing Updates"

From System to Admin:
- "Customer Order Logs"
- "Inventory Status Reports"
- "Real-Time Usage Analytics"

Important rules:
- Only these TWO external entities (Customer and Admin/Management).
- All data flows must pass through the central process. No direct entity-to-entity flows.
- No data store symbols in a Context Diagram.
- Label every arrow clearly with the specific data being transferred.
- Keep the diagram symmetrical and clean.
```

---

## Figure 4: Data Flow Diagram

**Doc Alignment:**
> "Figure 4 shows the Data Flow Diagram (DFD) of the Augmented Reality Furniture Sizing and Order-Precision System. This diagram provides a detailed view of how data moves throughout the system, showing where information originates, how it is processed, where it is stored, and how it is ultimately used."

**Prompt for Lucidchart AI:**

```
Create a Level 1 Data Flow Diagram for "AR-Fit: An Augmented Reality System for Accurate Furniture Sizing and Order Precision."

Orientation: VERTICAL (top-to-bottom flow). Arrange all elements in a single center column with data stores branching to the sides.

Style: ISO 5807 / Gane-Sarson DFD notation. Decompose the system into 4 major sub-processes. Academic style, clear labels. Keep it simple.

Symbols:
- Processes: Rounded rectangles (numbered 1.0, 2.0, etc.)
- External Entities: Rectangles
- Data Stores: Two horizontal parallel lines (or open-ended rectangle)
- Data Flows: Arrows with data labels

Layout (vertical stack, center-aligned, top to bottom):

[Top - External Entity]
- Rectangle "Customer" centered at the very top.
- Arrow pointing straight down to Process 1.0.

[Process 1.0 - center column]
- Rounded rectangle "1.0 Authenticate & Manage User"
- Data Store "D1 Users" placed to the LEFT of 1.0.
- Arrows:
  - Customer --> 1.0: "Login / Register"
  - 1.0 <--> D1: "Read / Write User Data"
  - 1.0 --> Customer (arrow going up/right back to Customer area): "Session / Profile"

[Process 2.0 - center column, below 1.0]
- Rounded rectangle "2.0 Browse & View in AR"
- Data Store "D2 Products" placed to the LEFT of 2.0.
- External Entity "AR Engine / Camera" placed to the RIGHT of 2.0.
- Arrows:
  - Customer --> 2.0: "Search / Select Product"
  - 2.0 <--> D2: "Query Products"
  - D2 --> 2.0: "Product Details + 3D Model URL"
  - 2.0 <--> "AR Engine": "Camera Feed <-> 3D Overlay"
  - 2.0 --> Customer (arrow going up/right back to Customer area): "AR Visualization + Size Feedback"

[Process 3.0 - center column, below 2.0]
- Rounded rectangle "3.0 Manage Cart & Place Order"
- Data Store "D3 Orders" placed to the RIGHT of 3.0.
- Data Store "D2 Products" also connects here (draw a second line or re-use D2 with an arrow from D2 to 3.0).
- Arrows:
  - Customer --> 3.0: "Add to Cart / Checkout"
  - 3.0 --> D2: "Check Stock"
  - D2 --> 3.0: "Stock Level"
  - 3.0 --> D3: "Create Order"
  - D3 --> 3.0: "Order ID + Status"
  - 3.0 --> Customer (arrow going up/right back to Customer area): "Order Confirmation + Invoice"

[Process 4.0 - center column, below 3.0]
- Rounded rectangle "4.0 Admin Dashboard"
- Data Store "D1 Users" placed to the LEFT (re-use or duplicate with asterisk).
- Data Store "D2 Products" placed to the LEFT (re-use or duplicate with asterisk).
- Data Store "D3 Orders" placed to the RIGHT (re-use or duplicate with asterisk).

[Bottom - External Entity]
- Rectangle "Admin / Management" centered at the very bottom.
- Arrow pointing straight up to Process 4.0.
- Arrows:
  - Admin --> 4.0: "Login / CRUD Operations"
  - 4.0 <--> D1: "Query Users"
  - 4.0 <--> D2: "Manage Products"
  - 4.0 <--> D3: "View / Update Orders"
  - 4.0 --> Admin (arrow going down/right back to Admin area): "Dashboard Statistics"

Important layout rules for vertical orientation:
- Keep the main process column perfectly center-aligned.
- Place data stores evenly on the LEFT and RIGHT sides of the center column.
- Use short horizontal arrows between center processes and side data stores.
- Use curved or elbow arrows for return flows back to the top external entities to avoid crossing the center column.
- Label every arrow with the specific data being transferred.
- No direct flow between external entities.
- No direct flow between data stores (must go through a process).
- Every process has at least one input and one output.
```

---

## Figure 5: Entity Relationship Diagram

**Doc Alignment:**
> "Figure 5 shows the Entity Relationship Diagram (ERD), which serves as a visual representation of how the system's database is organized and how different pieces of information are connected to one another. This diagram helps in understanding the overall structure of the system by clearly showing the relationships between key entities involved in the process."

**Prompt for Lucidchart AI:**

```
Create an Entity Relationship Diagram (ERD) for "AR-Fit: An Augmented Reality System for Accurate Furniture Sizing and Order Precision."

Style: Professional academic ERD. Use Crow's Foot notation (IE notation). Include primary keys (PK), foreign keys (FK), and attributes with concise data types. Keep it focused on the KEY entities only.

Entities and Attributes:

Entity: USERS
- _id (PK) - ObjectId
- email - String (UNIQUE)
- password - String
- fname - String
- lname - String
- contactNumber - String
- role - Enum [user, admin, superadmin]
- addresses - Array
- createdAt - DateTime

Entity: PRODUCTS
- _id (PK) - ObjectId
- name - String
- description - String
- price - Number
- category - String
- stock - Number
- imageUrl - String
- arModelUrl - String
- dimensions - Object {width, height, depth, unit}
- color - String
- isFeatured - Boolean
- isNewArrival - Boolean
- isSale - Boolean
- createdAt - DateTime

Entity: PRODUCT_VARIANTS
- id (PK) - String
- product_id (FK) - ObjectId
- name - String
- color - String
- stock - Number
- imageUrl - String
- arModelUrl - String

Entity: ORDERS
- _id (PK) - ObjectId
- userId (FK) - ObjectId
- customerName - String
- recipientName - String
- contactNumber - String
- email - String
- totalAmount - Number
- status - Enum [pending, processing, shipped, delivered, cancelled]
- shippingAddress - Object
- createdAt - DateTime

Entity: ORDER_ITEMS
- _id (PK) - ObjectId
- orderId (FK) - ObjectId
- productId (FK) - ObjectId
- productName - String
- price - Number
- quantity - Number
- imageUrl - String
- variantId - String (optional)
- variantName - String (optional)

Entity: CARTS
- _id (PK) - ObjectId
- userId (FK) - ObjectId (UNIQUE)
- items - Array of CartItem objects
- createdAt - DateTime

Relationships (Crow's Foot notation):
- USERS ||--o{ ORDERS : "places"
- USERS ||--o| CARTS : "has"
- ORDERS ||--o{ ORDER_ITEMS : "contains"
- PRODUCTS ||--o{ ORDER_ITEMS : "appears in"
- PRODUCTS ||--o{ PRODUCT_VARIANTS : "has variants"
- PRODUCTS ||--o{ CARTS (via items) : "added to"

Include a legend:
- || = One and only one
- |o = Zero or one
- }| = One or many
- }o = Zero or many
- PK = Primary Key
- FK = Foreign Key
```

---

## Figure 6: Use Case Diagram

**Doc Alignment:**
> "Figure 6 illustrates the Use Case Diagram, which provides a clear and structured view of how different users interact with the system. This diagram is essential in defining the system's functional requirements, as it outlines the specific actions that each type of user can perform and how these actions are connected within the system."

**Prompt for Lucidchart AI:**

```
Create a UML Use Case Diagram for "AR-Fit: An Augmented Reality System for Accurate Furniture Sizing and Order Precision."

Style: Standard UML 2.5 notation. Stick figures for actors, ellipses for use cases, rectangle for system boundary. Clean academic layout. Focus ONLY on the two user types.

System Boundary:
- Large rectangle labeled "AR-Fit System"

Actors (Stick Figures):
- Left side: "Customer" (primary actor)
- Left side (below Customer): "Admin / Management" (secondary actor)

Use Cases (Ellipses inside the system boundary):

[Customer Use Cases - left/center area]
1. "Register Account"
2. "Login"
3. "Browse Furniture Catalog"
4. "Search Products"
5. "View Product Details"
6. "View in AR" (include -> "Load 3D Model")
7. "Add to Cart"
8. "Manage Cart"
9. "Checkout / Place Order" (include -> "Validate Stock")
10. "View Order History"
11. "Track Order Status"
12. "Receive Notifications"
13. "Manage Profile"
14. "Request Password Reset"

[Admin Use Cases - center/right area]
15. "Admin Login"
16. "View Dashboard"
17. "Manage Products" (Add, Edit, Delete, Manage Variants)
18. "Manage Orders" (View, Update Status)
19. "Manage Marketing Banners"
20. "Manage Store Settings"

Relationships:
- Solid lines connect actors to the use cases they perform.
- Customer is connected to use cases 1-14.
- Admin is connected to use cases 15-20.

Include Relationships (dashed arrows with open arrowhead, labeled <<include>>):
- "Login" --<<include>>--> "Authenticate User"
- "View in AR" --<<include>>--> "Load 3D Model"
- "Checkout / Place Order" --<<include>>--> "Validate Stock"
- "View Dashboard" --<<include>>--> "Fetch Statistics"

Extend Relationships (dashed arrows with open arrowhead, labeled <<extend>>):
- "View in AR" --<<extend>>--> "Resize / Rotate Model" (condition: user adjusts model)

Layout: Customer use cases grouped on the left half, Admin use cases on the right half. Keep spacing clean and readable.
```

---

## Figure 7: Activity Diagram

**Doc Alignment:**
> "Figure 7 shows the Activity Diagram of the AR Furniture System, illustrating the step-by-step flow of actions that occur during a typical transaction. This diagram helps visualize the sequence of activities, decision points, and interactions between the customer, the system, and the admin."

**Prompt for Lucidchart AI:**

```
Create a UML Activity Diagram for "AR-Fit: An Augmented Reality System for Accurate Furniture Sizing and Order Precision."

Focus: A typical transaction flow from browsing to order placement, showing the three main participants.
Style: Standard UML 2.5 Activity Diagram notation. Use 3 swimlanes (partitions) for Customer, AR-Fit System, and Admin.

Swimlanes (vertical partitions from left to right):
1. "Customer" (Blue)
2. "AR-Fit System" (Green)
3. "Admin" (Orange)

Flow (top to bottom):

[Start Node] in Customer swimlane

Customer:
- Action: "Open Website & Browse Catalog"
- Decision: "Product Selected?"
  -- No --> back to "Browse Catalog"
  -- Yes --> Action: "Select Product"
- Action: "Tap 'View in AR'"

AR-Fit System:
- Action: "Load 3D Model & Initialize AR"
- Action: "Render Model in Real-World Space"

Customer:
- Action: "Adjust / Reposition Furniture"
- Decision: "Satisfied with Fit?"
  -- No --> back to "Adjust / Reposition"
  -- Yes --> Action: "Add to Cart"

AR-Fit System:
- Action: "Validate Stock"
- Decision: "In Stock?"
  -- No --> Action: "Show Out-of-Stock Message" -> back to Customer "Browse Catalog"
  -- Yes --> Action: "Add Item to Cart"

Customer:
- Action: "Proceed to Checkout"
- Action: "Enter Shipping Details"
- Action: "Confirm Order"

AR-Fit System:
- Action: "Create Order Record"
- Action: "Update Stock"
- Action: "Send Order Confirmation"
- Action: "Display Confirmation & Tracking"

Admin:
- Action: "View New Order"
- Action: "Process & Pack Order"
- Action: "Update Status to 'Shipped'"

AR-Fit System:
- Action: "Push Status Update to Customer"

Customer:
- Action: "Receive Notification"
- Action: "Track Delivery"
- Decision: "Order Delivered?"
  -- No --> "Continue Tracking"
  -- Yes --> Action: "Confirm Receipt"

[End Node] in Customer swimlane

Notes:
- Use rounded rectangles for actions.
- Use diamonds for decisions with labeled guards (Yes / No).
- Label all arrows clearly.
- Keep the diagram flowing top-to-bottom.
```

---

## Figure 8: Block Diagram

**Doc Alignment:**
> "Figure 8 presents the Block Diagram of the proposed AR Furniture system, offering a simplified yet comprehensive view of how the different components work together as one integrated system. This diagram helps in understanding the overall workflow, data flow, and interaction between the front-end, back-end, and database."

**Prompt for Lucidchart AI:**

```
Create a Block Diagram for "AR-Fit: An Augmented Reality System for Accurate Furniture Sizing and Order Precision."

Style: High-level academic block diagram. Simple geometric blocks, clear arrows, minimal internal detail. Use an explicit 3-row, 4-column grid layout so every block position is unambiguous.

Grid Layout (Row 1 = Top, Row 3 = Bottom; Column 1 = Left, Column 4 = Right):

[Row 1 — Top]
  Column 1: (empty space)
  Column 2: Purple rectangle "AR Processing Module"
    - Sub-labels inside:
      - "Room Scanning"
      - "3D Model Overlay"
      - "Size Calibration"
  Column 3: (empty space)
  Column 4: (empty space)

[Row 2 — Middle — Main horizontal flow]
  Column 1: Blue rectangle "User Input"
    - Sub-labels inside:
      - "Camera Feed"
      - "Product Selection"
      - "Order Data"
  Column 2: Green rectangle "Front-End (React Web App)"
    - Sub-labels inside:
      - "User Interface"
      - "AR Viewer"
      - "Cart & Checkout"
  Column 3: Green rectangle "Back-End (Express API)"
    - Sub-labels inside:
      - "Authentication"
      - "Product Management"
      - "Order Processing"
  Column 4: Blue rectangle "System Output"
    - Sub-labels inside:
      - "AR Visualization"
      - "Order Confirmation"
      - "Status Updates"

[Row 3 — Bottom]
  Column 1: (empty space)
  Column 2: (empty space)
  Column 3: Orange rectangle "Database (MongoDB + Supabase)"
    - Sub-labels inside:
      - "User Records"
      - "Product Catalog"
      - "Order Logs"
      - "3D Model Files"
  Column 4: (empty space)

Arrows / Connections (drawn as straight orthogonal lines with right-angle bends where needed):
1. "User Input" (R2C1) → "Front-End" (R2C2): horizontal arrow labeled "Browse / Select"
2. "Front-End" (R2C2) → "AR Processing Module" (R1C2): vertical arrow pointing UP, labeled "Camera + Model Request"
3. "AR Processing Module" (R1C2) → "Front-End" (R2C2): vertical arrow pointing DOWN, labeled "3D Overlay + Sizing"
4. "Front-End" (R2C2) → "Back-End" (R2C3): horizontal arrow labeled "API Requests (JSON)"
5. "Back-End" (R2C3) → "Database" (R3C3): vertical arrow pointing DOWN, labeled "Read / Write Data"
6. "Database" (R3C3) → "Back-End" (R2C3): vertical arrow pointing UP, labeled "Query Results"
7. "Back-End" (R2C3) → "Front-End" (R2C2): horizontal arrow pointing LEFT, labeled "Responses / Notifications"
8. "Front-End" (R2C2) → "System Output" (R2C4): horizontal arrow labeled "Rendered UI"
9. "System Output" (R2C4) → "User Input" (R2C1): horizontal arrow pointing LEFT (dashed optional), labeled "Feedback Loop"

Spacing rules:
- Keep Row 2 blocks evenly sized and aligned on the same horizontal centerline.
- Keep Row 1 AR Module centered directly above the Front-End block.
- Keep Row 3 Database centered directly below the Back-End block.
- Do not overlap any blocks. Maintain at least 1 inch (or 80 pixels) between adjacent blocks.

Include a simple legend at the bottom:
- Blue = External / Input-Output
- Green = Application Logic
- Orange = Data Storage
- Purple = AR Processing
```

---

## Figure 9: Schematic / Deployment Diagram

**Doc Alignment:**
> "The Deployment Diagram in Figure 9 shows how the system operates in the real world. This software-based system runs on standard web-capable devices. The Client Tier is the user's web browser, which accesses the AR Furniture website app. The Internet (Communication Tier) connects the client to the Data Tier, which is managed through Supabase document storage and cloud services. The diagram demonstrates that no specialized hardware is required; the system relies on cloud infrastructure to handle user authentication, real-time data synchronization, 3D AR processing, and file storage."

**Prompt for Lucidchart AI:**

```
Create a Deployment Diagram for "AR-Fit: An Augmented Reality System for Accurate Furniture Sizing and Order Precision."

Style: Standard UML 2.5 Deployment Diagram notation simplified for academic clarity. Use 3D boxes (cubes) for major tiers. Focus on the THREE tiers described in the documentation.

Nodes:

[Top Tier - Blue - 3D Cube]
Node: <<device>> "Client Tier"
  - Sub-labels:
    - "User's Web Browser"
    - "Desktop / Mobile / Tablet"
    - "AR Furniture Website App"
  - Note attached: "No specialized hardware required"

[Middle Tier - Gray - 3D Cube]
Node: <<device>> "Communication Tier"
  - Sub-labels:
    - "Internet"
    - "HTTPS / TCP Connection"

[Bottom Tier - Orange / Purple - 3D Cube]
Node: <<device>> "Data Tier"
  - Sub-labels:
    - "Supabase Document Storage"
    - "Cloud Database (MongoDB)"
    - "3D Model File Storage"
  - Note attached: "Handles: authentication, real-time sync, 3D AR processing, file storage"

Connections (solid lines with protocol labels):
1. Client Tier -> Communication Tier: <<HTTPS>> "User requests + camera data"
2. Communication Tier -> Data Tier: <<HTTPS>> "API calls + database queries"
3. Data Tier -> Communication Tier: <<HTTPS>> "Responses + 3D model URLs + stock data"
4. Communication Tier -> Client Tier: <<HTTPS>> "AR visualization + order confirmations"

Include a simple legend:
- 3D Cube = Deployment Node / Tier
- <<stereotype>> = UML Stereotype
- Solid line = Communication Path
- Label on line = Protocol / Data type

Keep the diagram vertically stacked (Client on top, Communication in middle, Data on bottom) to clearly show the three-tier structure described in the documentation.
```

---

## Figure 10: Class Diagram

**Doc Alignment:**
> "Figure 10 shows the Class Diagram of the AR-Fit system, which illustrates the structural composition of the system's main classes, their attributes, methods, and the relationships between them. This diagram provides an object-oriented view of the system by defining how data entities and service components interact, inherit properties, and depend on one another throughout the application lifecycle."

**Prompt for Lucidchart AI:**

```
Create a UML Class Diagram for "AR-Fit: An Augmented Reality System for Accurate Furniture Sizing and Order Precision."

Style: Standard UML 2.5 notation. Three-compartment rectangles (Class Name | Attributes | Methods). Clean academic layout. Focus on the core domain model and key service classes that reflect the actual system. This is a design-level class diagram (not a conceptual domain model), so include service classes and data types.

Classes and Members (order members by visibility: public first, then protected, then private; omit trivial getters/setters):

[Domain Model Classes]

Class: User
- Attributes (private):
  - _id: ObjectId
  - email: String
  - password: String
  - fname: String
  - lname: String
  - contactNumber: String
  - role: Enum [user, admin, superadmin]
  - addresses: Array
  - createdAt: DateTime
- Methods (public):
  + login(): boolean
  + register(): boolean
  + updateProfile(): boolean
  + addAddress(): void
  + changePassword(): boolean

Class: Product
- Attributes (private):
  - _id: ObjectId
  - name: String
  - description: String
  - price: Number
  - category: String
  - stock: Number
  - imageUrl: String
  - arModelUrl: String
  - dimensions: Object
  - color: String
  - isFeatured: Boolean
  - isNewArrival: Boolean
  - isSale: Boolean
  - createdAt: DateTime
- Methods (public):
  + getDetails(): Product
  + updateStock(qty: Number): boolean
  + getVariants(): ProductVariant[]
  + toggleFeatured(): void

Class: ProductVariant
- Attributes (private):
  - id: String
  - product_id: ObjectId
  - name: String
  - color: String
  - stock: Number
  - imageUrl: String
  - arModelUrl: String
- Methods (public):
  + getParentProduct(): Product
  + updateStock(qty: Number): boolean

Class: Order
- Attributes (private):
  - _id: ObjectId
  - userId: ObjectId
  - customerName: String
  - recipientName: String
  - contactNumber: String
  - email: String
  - totalAmount: Number
  - status: Enum [pending, processing, shipped, delivered, cancelled]
  - shippingAddress: Object
  - createdAt: DateTime
- Methods (public):
  + createOrder(): Order
  + updateStatus(status: String): boolean
  + calculateTotal(): Number
  + getItems(): OrderItem[]

Class: OrderItem
- Attributes (private):
  - _id: ObjectId
  - orderId: ObjectId
  - productId: ObjectId
  - productName: String
  - price: Number
  - quantity: Number
  - imageUrl: String
  - variantId: String
  - variantName: String
- Methods (public):
  + getProduct(): Product
  + getOrder(): Order

Class: Cart
- Attributes (private):
  - _id: ObjectId
  - userId: ObjectId
  - items: Array[CartItem]
  - createdAt: DateTime
- Methods (public):
  + addItem(item: CartItem): void
  + removeItem(itemId: ObjectId): void
  + updateQuantity(itemId: ObjectId, qty: Number): void
  + clearCart(): void
  + getTotal(): Number

Class: CartItem
- Attributes (private):
  - productId: ObjectId
  - productName: String
  - price: Number
  - quantity: Number
  - imageUrl: String
  - variantId: String
  - variantName: String

[Service Classes]

Class: <<Service>> AuthService
- Methods (public):
  + authenticate(credentials: Object): boolean
  + authorize(role: String): boolean
  + hashPassword(pw: String): String
  + verifyToken(token: String): boolean
  + sendResetEmail(email: String): void

Class: <<Service>> ProductService
- Methods (public):
  + getAll(): Product[]
  + getById(id: ObjectId): Product
  + create(data: Object): Product
  + update(id: ObjectId, data: Object): Product
  + delete(id: ObjectId): boolean
  + uploadImage(file: File): String

Class: <<Service>> OrderService
- Methods (public):
  + createOrder(data: Object): Order
  + getByUser(userId: ObjectId): Order[]
  + updateStatus(orderId: ObjectId, status: String): boolean
  + sendConfirmationEmail(orderId: ObjectId): void
  + validateStock(productId: ObjectId, qty: Number): boolean

Relationships:
- User "1" -- "0..1" Cart : owns (composition, filled diamond on User side)
  Note: Cart is destroyed when User is deleted.
- User "1" -- "0..*" Order : places (association, no diamond)
  Note: Order persists independently; historical records are retained even if User is deleted.
- Order "1" -- "1..*" OrderItem : contains (composition, filled diamond on Order side)
  Note: OrderItems are destroyed when Order is deleted.
- Product "1" -- "0..*" ProductVariant : has (composition, filled diamond on Product side)
  Note: Variants are destroyed when Product is deleted.
- Product "1" -- "0..*" OrderItem : appears in (association, no diamond)
  Note: Product exists independently of OrderItem.
- Cart "1" -- "0..*" CartItem : contains (composition, filled diamond on Cart side)
  Note: CartItems are destroyed when Cart is deleted.
- AuthService ..> User : uses (dependency, dashed arrow)
- ProductService ..> Product : manages (dependency, dashed arrow)
- OrderService ..> Order : manages (dependency, dashed arrow)
- OrderService ..> Product : checks stock (dependency, dashed arrow)

Layout and readability rules (2026 academic best practices):
- Place domain model classes (User, Product, ProductVariant, Order, OrderItem, Cart, CartItem) in the center-left area.
- Place service classes (AuthService, ProductService, OrderService) to the right of the domain classes.
- Keep related classes adjacent: Product directly above ProductVariant; Order directly above OrderItem; Cart directly above CartItem.
- Draw all association lines as orthogonal (horizontal or vertical) with right-angle bends only.
- NO crossing lines. If two lines must cross, redesign the layout or use a curved arc.
- Fit the entire diagram on a single page. Do not crowd classes; maintain at least 1 inch between adjacent class boxes.
- Place parent/superclasses above child/subclasses if inheritance is shown.
- Center association names and role labels on the lines.
- Make all associations directed (use arrows) where direction is known; undirected only for bidirectional navigability.

Include a legend at the bottom right:
- Three-compartment rectangle = Class (Name | Attributes | Methods)
- + / - / # = Public / Private / Protected visibility
- Solid line with open arrow = Association (directed)
- Solid line with filled diamond = Composition (lifecycle-managed whole-part)
- Dashed line with open arrow = Dependency
- Multiplicity labels (1, 0..1, 0..*, 1..*) = Cardinality
- <<Service>> stereotype = Application service class
```

---

## Summary of Standards Applied

| Figure | Diagram Type | Standard / Notation | Key Rules Enforced |
|--------|-------------|---------------------|-------------------|
| 2 | System Architecture | Academic block-style | Aligned with doc: User -> App -> AR Module + Cloud DB -> User |
| 3 | Context Diagram (DFD Level 0) | ISO 5807 / Gane-Sarson | Only 2 external entities (Customer, Admin); single system process |
| 4 | Data Flow Diagram (Level 1) | ISO 5807 / Gane-Sarson | 4 core processes; no entity-to-entity or store-to-store flows |
| 5 | Entity Relationship Diagram | Crow's Foot (IE) Notation | PK/FK labeled; 6 core entities reflecting actual system |
| 6 | Use Case Diagram | UML 2.5 | 2 actors (Customer, Admin); core functional use cases only |
| 7 | Activity Diagram | UML 2.5 | 3 swimlanes (Customer, System, Admin); typical transaction flow |
| 8 | Block Diagram | IEEE/Academic Standard | 4 core blocks: Input, Front-End, Back-End, Database, AR Module, Output |
| 9 | Deployment Diagram | UML 2.5 simplified | 3 tiers: Client, Communication, Data; aligned with doc description |
| 10 | Class Diagram | UML 2.5 design-level | 7 domain classes + 3 «Service» stereotyped classes; composition (filled diamond) for lifecycle-managed relationships, simple association for independent entities, dependency for service-to-domain links; return types on all methods; visibility symbols shown; no crossing lines |

---

## How to Use These Prompts in Lucidchart AI

1. Open Lucidchart (lucidchart.com) and create a new document.
2. Click the **AI** button or use **Lucidchart AI** chat.
3. Paste each prompt one at a time, clearly stating: "Create this diagram: [paste prompt]."
4. After generation, manually refine:
   - Ensure all labels match the AR-Fit system entities and the thesis descriptions.
   - Adjust colors to match the recommended palette.
   - Verify notation rules are correctly applied.
   - Add figure captions below each diagram: "Figure X: [Title]".
5. Export diagrams as PNG or SVG for insertion into the thesis document.

---

*Generated based on complete codebase analysis, NotebookLM deep research on capstone diagram best practices, and aligned with the thesis document descriptions.*
