<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Facades\Acumatica;

class FetchAcumaticaData extends Command
{
    protected $signature = 'acumatica:fetch {entity?}';
    protected $description = 'Fetch all records of a specified entity from Acumatica and save locally. If no entity is specified, fetch all entities.';

    public function handle()
    {
        $entity = $this->argument('entity');

        $entities = $this->getEntities();

        if (!$entity) {
            $this->info("No entity specified. Fetching all entities...");
            $this->fetchAllEntities($entities);
        } else {
            // Check if the entity exists in the predefined list
            $params = $entities[$entity] ?? [];
            $this->fetchAndSaveData($entity, $params);
        }

        $this->info("Data fetching completed.");
    }

    private function fetchAllEntities(array $entities)
    {
        foreach ($entities as $entity => $params) {
            $this->fetchAndSaveData($entity, $params);
        }
    }

    private function fetchAndSaveData(string $entity, array $params = [])
    {
        if ($entity === 'SalesOrder' || $entity === 'StockItem') {
            Acumatica::fetchAndSaveDataInChunks($entity, $params);
        } else {
            Acumatica::fetchAndSaveData($entity, $params);
        }

        $this->info("$entity data fetched and saved successfully.");
    }

    private function getEntities(): array
    {
        return [
            'Customer' => [
                '$expand' => 'MainContact',
                '$select' => 'CustomerID,CustomerName,CustomerClass,MainContact/Email,MainContact/Phone1,MainContact/Address/AddressLine1,MainContact/Address/AddressLine2,MainContact/Address/City,MainContact/Address/State,MainContact/Address/PostalCode,PrimaryContactID'
            ],
            'BusinessAccount' => [
                '$select' => 'Name'
            ],
            'SalesOrder' => [
                '$expand' => 'Details,Shipments',
                '$select' => 'ContactID,CreatedDate,CurrencyID,CustomerID,Date,Description,EffectiveDate,LastModified,OrderedQty,OrderNbr,OrderTotal,Status,Details/InventoryID,Details/OrderQty,Details/UnitPrice,Details/DiscountAmount,Details/Amount,Details/ExtendedPrice,Details/UnitCost,Details/AverageCost,Details/Location,Details/LineDescription,Details/WarehouseID,Shipments/InventoryRefNbr,Shipments/InvoiceNbr,Shipments/InvoiceType,Shipments/ShipmentDate,Shipments/ShipmentNbr,Shipments/ShipmentType,Shipments/ShippedQty,Shipments/Status',
                '$top' => 2500
            ],
            'Invoice' => [
                '$select' => 'ReferenceNbr,Amount,Description'
            ],
            'Contact' => [
                '$expand' => 'Address',
                '$select' => 'FirstName,MiddleName,LastName,Email,Phone1,Phone1Type,Phone2,Phone2Type,Phone3,Phone3Type,Website,Status,OverrideAccountAddress,Address/AddressLine1,Address/AddressLine2,Address/City,Address/State,Address/PostalCode,Address/Country'
            ],
            'NonStockItem' => [
                '$select' => 'InventoryID,Description,CurrentStdCost,DefaultPrice,ItemType'
            ],
            'StockItem' => [
                '$expand' => 'WarehouseDetails',
                '$select' => 'InventoryID,Description,WarehouseDetails/WarehouseID,WarehouseDetails/QtyOnHand,ItemClass,BaseUOM,CurrentStdCost,DefaultPrice,DefaultWarehouseID,WarehouseDetails/PreferredVendor',
                '$top' => 100
            ],
            'Warehouse' => [
                '$select' => 'WarehouseID,Description'
            ]
        ];
    }
}
