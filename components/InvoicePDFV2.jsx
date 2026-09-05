import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '2px solid #3B82F6',
    paddingBottom: 8,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  companyAddress: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'right',
  },
  clientBox: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clientTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientRow: {
    flexDirection: 'row',
    paddingVertical: 1,
  },
  clientLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0F172A',
    width: 60,
  },
  clientValue: {
    fontSize: 9,
    color: '#0F172A',
    flex: 1,
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: 6,
  },
  metaItem: {
    minWidth: 70,
  },
  metaLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 1,
  },
  metaValue: {
    fontSize: 9,
    color: '#0F172A',
  },
  table: {
    width: '100%',
    marginVertical: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 4,
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#475569',
    paddingHorizontal: 3,
  },
  colDesc: {
    width: '34%',
    fontSize: 8,
    paddingHorizontal: 3,
    flexWrap: 'wrap',
  },
  colQty: {
    width: '12%',
    fontSize: 8,
    paddingHorizontal: 3,
    textAlign: 'center',
  },
  colPrice: {
    width: '16%',
    fontSize: 8,
    paddingHorizontal: 3,
    textAlign: 'right',
  },
  colDisc: {
    width: '16%',
    fontSize: 8,
    paddingHorizontal: 3,
    textAlign: 'center',
  },
  colTotal: {
    width: '22%',
    fontSize: 8,
    paddingHorizontal: 3,
    textAlign: 'right',
  },
  totalsBox: {
    marginTop: 8,
    alignItems: 'flex-end',
    borderTop: '1px solid #CBD5E1',
    paddingTop: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '45%',
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: 'medium',
    flexShrink: 0,
    marginRight: 8,
  },
  totalValue: {
    fontSize: 9,
    textAlign: 'right',
    flexShrink: 0,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '45%',
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    marginTop: 2,
    borderRadius: 3,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    flexShrink: 0,
    marginRight: 8,
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    flexShrink: 0,
  },
  // 🆕 সিগনেচার সেকশন - Image ব্যবহার
  signatureSection: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTop: '1px solid #E2E8F0',
    paddingTop: 10,
  },
  signatureBox: {
    width: '35%',
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 4,
  },
  signatureImage: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  signatureLine: {
    borderBottom: '1px solid #0F172A',
    width: '100%',
    height: 25,
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  signatureText: {
    fontSize: 8,
    color: '#0F172A',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#94A3B8',
    borderTop: '1px solid #E2E8F0',
    paddingTop: 6,
  },
});

export default function InvoicePDFV2({ formData, totals, signatureImage }) {
  const {
    invoiceNo,
    date,
    dueDate,
    clientName,
    clientAddress,
    clientSiret,
    items,
    paymentMethod,
    currency = '€',
  } = formData;

  const subtotal = totals?.totalHT || 0;
  const taxAmount = totals?.tva || 0;
  const total = totals?.totalTTC || 0;
  const taxRate = 10;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Mahadi Express</Text>
            <Text style={styles.companyAddress}>
              5 RES DES TROIS FORETS., 78380 Bougival, France
            </Text>
          </View>
          <Text style={styles.invoiceTitle}>FACTURE</Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientBox}>
          <Text style={styles.clientTitle}>FACTURE À</Text>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Name:</Text>
            <Text style={styles.clientValue}>
              {clientName || '___________'}
            </Text>
          </View>
          {clientAddress && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Address:</Text>
              <Text style={styles.clientValue}>{clientAddress}</Text>
            </View>
          )}
          {clientSiret && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>SIRET:</Text>
              <Text style={styles.clientValue}>{clientSiret}</Text>
            </View>
          )}
        </View>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Facture N°</Text>
            <Text style={styles.metaValue}>{invoiceNo}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Échéance</Text>
            <Text style={styles.metaValue}>{dueDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Paiement</Text>
            <Text style={styles.metaValue}>{paymentMethod}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.tableHeaderText]}>
              DESCRIPTION
            </Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>QTÉ</Text>
            <Text style={[styles.colPrice, styles.tableHeaderText]}>
              PRIX (€)
            </Text>
            <Text style={[styles.colDisc, styles.tableHeaderText]}>
              REMISE %
            </Text>
            <Text style={[styles.colTotal, styles.tableHeaderText]}>
              MONTANT (€)
            </Text>
          </View>
          {items.map((item, idx) => {
            const total =
              (item.quantity || 0) *
              (item.price || 0) *
              (1 - (item.discount || 0) / 100);
            return (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colDesc}>{item.description || '-'}</Text>
                <Text style={styles.colQty}>{item.quantity || 0}</Text>
                <Text style={styles.colPrice}>
                  {(item.price || 0).toFixed(2)}
                </Text>
                <Text style={styles.colDisc}>
                  {(item.discount || 0).toFixed(0)}%
                </Text>
                <Text style={styles.colTotal}>{total.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL H.T.</Text>
            <Text style={styles.totalValue}>
              {subtotal.toFixed(2)} {currency}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({taxRate}%)</Text>
            <Text style={styles.totalValue}>
              {taxAmount.toFixed(2)} {currency}
            </Text>
          </View>
          <View style={[styles.totalRow, { fontWeight: 'bold' }]}>
            <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>
              MONTANT TOTAL (TTC)
            </Text>
            <Text style={[styles.totalValue, { fontWeight: 'bold' }]}>
              {total.toFixed(2)} {currency}
            </Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>TOTAL À PAYER (EUR)</Text>
            <Text style={styles.grandTotalValue}>
              {total.toFixed(2)} {currency}
            </Text>
          </View>
        </View>

        {/* 🆕 সিগনেচার ইমেজ */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Signature de l'entreprise</Text>
            {signatureImage ? (
              <Image src={signatureImage} style={styles.signatureImage} />
            ) : (
              <View style={styles.signatureLine}>
                <Text style={styles.signatureText}>_________________</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your trust. Payment due within 30 days.</Text>
        </View>
      </Page>
    </Document>
  );
}
