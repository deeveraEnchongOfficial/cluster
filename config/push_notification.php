<?php

return [
    'mapping' => [
        'contacts' => [
            'processor' => App\Modules\Acumatica\Contact\ProcessContactTransaction::class,
            'synchronizer' => App\Modules\Acumatica\Contact\ContactSync::class,
        ],
        'customers' => [
            'processor' => App\Modules\Acumatica\Customer\ProcessCustomerTransaction::class,
            'synchronizer' => App\Modules\Acumatica\Customer\CustomerSync::class,
        ],
        'salesorders' => [
            'processor' => App\Modules\Acumatica\SalesOrder\ProcessSalesOrderTransaction::class,
            'synchronizer' => App\Modules\Acumatica\SalesOrder\SalesOrderSync::class,
        ],
        'solineitems' => [
            'processor' => App\Modules\Acumatica\SOLineItem\ProcessSOLineItemTransaction::class,
            'synchronizer' => App\Modules\Acumatica\SOLineItem\SOLineItemSync::class,
        ],
        'soinvoices' => [
            'processor' => App\Modules\Acumatica\SOInvoice\ProcessSOInvoiceTransaction::class,
            'synchronizer' => App\Modules\Acumatica\SOInvoice\SOInvoiceSync::class,
        ],
        'stockitems' => [
            'processor' => App\Modules\Acumatica\StockItem\ProcessStockItemTransaction::class,
            'synchronizer' => App\Modules\Acumatica\StockItem\StockItemSync::class,
        ],
        'nonstockitems' => [
            'processor' => App\Modules\Acumatica\NonStockItem\ProcessNonStockItemTransaction::class,
            'synchronizer' => App\Modules\Acumatica\NonStockItem\NonStockItemSync::class,
        ],
        'itemwarehouses' => [
            'processor' => App\Modules\Acumatica\ItemWarehouse\ProcessItemWarehouseTransaction::class,
            'synchronizer' => App\Modules\Acumatica\ItemWarehouse\ItemWarehouseSync::class,
        ],
        'warehouses' => [
            'processor' => App\Modules\Acumatica\Warehouse\ProcessWarehouseTransaction::class,
            'synchronizer' => App\Modules\Acumatica\Warehouse\WarehouseSync::class,
        ]
    ],
];
